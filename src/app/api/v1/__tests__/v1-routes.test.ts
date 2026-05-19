jest.mock("@drizzle", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolve = (r: any) => r([{ count: 0 }])
  const chain = { then: resolve, where: jest.fn().mockReturnValue({ then: resolve }) }
  return { db: { select: jest.fn().mockReturnValue({ from: jest.fn().mockReturnValue(chain) }) } }
})
jest.mock("@/server/services/subscriptions", () => ({
  requirePlan: jest.fn(),
  getActivePlan: jest.fn(),
  getFreePlan: jest.fn(),
}))
jest.mock("@/app/api/v1/_lib/auth", () => ({
  resolveCaller: jest.fn(),
}))
jest.mock("@/server/services/races", () => ({
  listRaces: jest.fn(),
  getRace: jest.fn(),
  createRace: jest.fn(),
  updateRace: jest.fn(),
  deleteRace: jest.fn(),
}))
jest.mock("@/server/services/participants", () => ({
  listParticipants: jest.fn(),
  joinRace: jest.fn(),
  updateProgress: jest.fn(),
  leaveRace: jest.fn(),
}))
jest.mock("@/server/services/winners", () => ({
  listWinners: jest.fn(),
}))
jest.mock("@/server/services/api-keys", () => ({
  listApiKeys: jest.fn(),
  createApiKey: jest.fn(),
  revokeApiKey: jest.fn(),
}))

import { ServiceError } from "@/server/services/errors"
import { resolveCaller } from "@/app/api/v1/_lib/auth"
import * as racesSvc from "@/server/services/races"
import * as participantsSvc from "@/server/services/participants"
import * as winnersSvc from "@/server/services/winners"
import * as apiKeysSvc from "@/server/services/api-keys"

import { GET as racesList, POST as racesCreate } from "../races/route"
import {
  GET as raceGet,
  PATCH as racePatch,
  DELETE as raceDelete,
} from "../races/[id]/route"
import {
  GET as participantsList,
  POST as participantsJoin,
} from "../races/[id]/participants/route"
import {
  PATCH as participantPatch,
  DELETE as participantDelete,
} from "../races/[id]/participants/[participantId]/route"
import { GET as winnersGet } from "../winners/route"
import { GET as meGet } from "../me/route"
import {
  GET as apiKeysList,
  POST as apiKeysCreate,
} from "../me/api-keys/route"
import { DELETE as apiKeyRevoke } from "../me/api-keys/[id]/route"

const mockResolveCaller = resolveCaller as jest.MockedFunction<
  typeof resolveCaller
>

const SESSION_CALLER = {
  userId: "user-1",
  source: "session" as const,
  plan: { id: "free", name: "Free", limits: {} },
}
const API_KEY_CALLER = {
  userId: "user-2",
  source: "api_key" as const,
  plan: { id: "free", name: "Free", limits: {} },
}

const RACE_ID = "11111111-1111-4111-8111-111111111111"
const PARTICIPANT_ID = "22222222-2222-4222-8222-222222222222"
const KEY_ID = "33333333-3333-4333-8333-333333333333"

function req(url: string, init?: RequestInit) {
  return new Request(`http://localhost${url}`, init)
}
function ctx(params: Record<string, string> = {}) {
  return { params: Promise.resolve(params) }
}
function jsonReq(url: string, method: string, body: unknown) {
  return req(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockResolveCaller.mockResolvedValue(null)
})

describe("GET /api/v1/races", () => {
  it("returns list (anonymous)", async () => {
    (racesSvc.listRaces as jest.Mock).mockResolvedValue([{ id: RACE_ID }])
    const res = await racesList(req("/api/v1/races"), ctx())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(expect.objectContaining({ data: [{ id: RACE_ID }] }))
  })
})

describe("POST /api/v1/races", () => {
  it("401 when unauthenticated", async () => {
    const res = await racesCreate(
      jsonReq("/api/v1/races", "POST", { title: "t", text: "x" }),
      ctx()
    )
    expect(res.status).toBe(401)
    expect((await res.json()).error.code).toBe("UNAUTHENTICATED")
    expect(racesSvc.createRace).not.toHaveBeenCalled()
  })

  it("400 on invalid body", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER)
    const res = await racesCreate(
      jsonReq("/api/v1/races", "POST", { title: "" }),
      ctx()
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe("VALIDATION_ERROR")
  })

  it("201 on success", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER);
    (racesSvc.createRace as jest.Mock).mockResolvedValue({ id: RACE_ID })
    const res = await racesCreate(
      jsonReq("/api/v1/races", "POST", { title: "t", text: "x" }),
      ctx()
    )
    expect(res.status).toBe(201)
    expect(racesSvc.createRace).toHaveBeenCalledWith({
      title: "t",
      text: "x",
    })
  })
})

describe("GET /api/v1/races/{id}", () => {
  it("rejects non-uuid param with 400", async () => {
    const res = await raceGet(req("/api/v1/races/abc"), ctx({ id: "abc" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe("VALIDATION_ERROR")
  })

  it("maps NOT_FOUND service error to 404", async () => {
    (racesSvc.getRace as jest.Mock).mockRejectedValue(
      new ServiceError("NOT_FOUND", "Race not found")
    )
    const res = await raceGet(
      req(`/api/v1/races/${RACE_ID}`),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(404)
  })

  it("returns race", async () => {
    (racesSvc.getRace as jest.Mock).mockResolvedValue({ id: RACE_ID })
    const res = await raceGet(
      req(`/api/v1/races/${RACE_ID}`),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: { id: RACE_ID } })
  })
})

describe("PATCH/DELETE /api/v1/races/{id}", () => {
  it("PATCH requires auth", async () => {
    const res = await racePatch(
      jsonReq(`/api/v1/races/${RACE_ID}`, "PATCH", { title: "new" }),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(401)
  })

  it("PATCH succeeds with auth", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER);
    (racesSvc.updateRace as jest.Mock).mockResolvedValue({
      id: RACE_ID,
      title: "new",
    })
    const res = await racePatch(
      jsonReq(`/api/v1/races/${RACE_ID}`, "PATCH", { title: "new" }),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(200)
    expect(racesSvc.updateRace).toHaveBeenCalledWith(RACE_ID, { title: "new" })
  })

  it("DELETE succeeds with auth", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER);
    (racesSvc.deleteRace as jest.Mock).mockResolvedValue({ id: RACE_ID })
    const res = await raceDelete(
      req(`/api/v1/races/${RACE_ID}`, { method: "DELETE" }),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(200)
  })
})

describe("/api/v1/races/{id}/participants", () => {
  it("GET lists participants (anonymous)", async () => {
    (participantsSvc.listParticipants as jest.Mock).mockResolvedValue([])
    const res = await participantsList(
      req(`/api/v1/races/${RACE_ID}/participants`),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(200)
    expect(participantsSvc.listParticipants).toHaveBeenCalledWith(RACE_ID, 20, 0)
  })

  it("POST joins (anonymous allowed)", async () => {
    (participantsSvc.joinRace as jest.Mock).mockResolvedValue({
      id: PARTICIPANT_ID,
    })
    const res = await participantsJoin(
      jsonReq(`/api/v1/races/${RACE_ID}/participants`, "POST", {
        nickname: "alice",
      }),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(201)
    expect(participantsSvc.joinRace).toHaveBeenCalledWith({
      raceId: RACE_ID,
      nickname: "alice",
    })
  })

  it("POST 409 when service throws CONFLICT", async () => {
    (participantsSvc.joinRace as jest.Mock).mockRejectedValue(
      new ServiceError("CONFLICT", "Race is not active")
    )
    const res = await participantsJoin(
      jsonReq(`/api/v1/races/${RACE_ID}/participants`, "POST", {
        nickname: "alice",
      }),
      ctx({ id: RACE_ID })
    )
    expect(res.status).toBe(409)
  })
})

describe("/api/v1/races/{id}/participants/{participantId}", () => {
  it("PATCH updates progress", async () => {
    (participantsSvc.updateProgress as jest.Mock).mockResolvedValue({
      id: PARTICIPANT_ID,
      progress: 50,
    })
    const res = await participantPatch(
      jsonReq(
        `/api/v1/races/${RACE_ID}/participants/${PARTICIPANT_ID}`,
        "PATCH",
        { progress: 50, mistakes: 1, totalAttempted: 10, wpm: 30 }
      ),
      ctx({ id: RACE_ID, participantId: PARTICIPANT_ID })
    )
    expect(res.status).toBe(200)
    expect(participantsSvc.updateProgress).toHaveBeenCalledWith(
      PARTICIPANT_ID,
      expect.objectContaining({ progress: 50, wpm: 30 })
    )
  })

  it("DELETE leaves race", async () => {
    (participantsSvc.leaveRace as jest.Mock).mockResolvedValue(undefined)
    const res = await participantDelete(
      req(`/api/v1/races/${RACE_ID}/participants/${PARTICIPANT_ID}`, {
        method: "DELETE",
      }),
      ctx({ id: RACE_ID, participantId: PARTICIPANT_ID })
    )
    expect(res.status).toBe(200)
    expect(participantsSvc.leaveRace).toHaveBeenCalledWith(
      RACE_ID,
      PARTICIPANT_ID
    )
  })
})

describe("GET /api/v1/winners", () => {
  it("coerces limit query param", async () => {
    (winnersSvc.listWinners as jest.Mock).mockResolvedValue([])
    const res = await winnersGet(req("/api/v1/winners?limit=5"), ctx())
    expect(res.status).toBe(200)
    expect(winnersSvc.listWinners).toHaveBeenCalledWith(5, 0)
  })

  it("rejects out-of-range limit", async () => {
    const res = await winnersGet(req("/api/v1/winners?limit=999"), ctx())
    expect(res.status).toBe(400)
  })
})

describe("GET /api/v1/me", () => {
  it("401 anonymous", async () => {
    const res = await meGet(req("/api/v1/me"), ctx())
    expect(res.status).toBe(401)
  })

  it("returns caller summary", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER)
    const res = await meGet(req("/api/v1/me"), ctx())
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: {
        userId: "user-1",
        source: "session",
        plan: SESSION_CALLER.plan,
      },
    })
  })
})

describe("/api/v1/me/api-keys", () => {
  it("GET 403 when caller is api_key", async () => {
    mockResolveCaller.mockResolvedValue(API_KEY_CALLER)
    const res = await apiKeysList(req("/api/v1/me/api-keys"), ctx())
    expect(res.status).toBe(403)
    expect(apiKeysSvc.listApiKeys).not.toHaveBeenCalled()
  })

  it("GET lists when session", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER);
    (apiKeysSvc.listApiKeys as jest.Mock).mockResolvedValue([{ id: KEY_ID }])
    const res = await apiKeysList(req("/api/v1/me/api-keys"), ctx())
    expect(res.status).toBe(200)
    expect(apiKeysSvc.listApiKeys).toHaveBeenCalledWith("user-1", 20, 0)
  })

  it("POST 403 when caller is api_key", async () => {
    mockResolveCaller.mockResolvedValue(API_KEY_CALLER)
    const res = await apiKeysCreate(
      jsonReq("/api/v1/me/api-keys", "POST", { name: "k" }),
      ctx()
    )
    expect(res.status).toBe(403)
  })

  it("POST creates key when session", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER);
    (apiKeysSvc.createApiKey as jest.Mock).mockResolvedValue({
      id: KEY_ID,
      token: "tr_live_abc",
    })
    const res = await apiKeysCreate(
      jsonReq("/api/v1/me/api-keys", "POST", { name: "k" }),
      ctx()
    )
    expect(res.status).toBe(201)
    expect(apiKeysSvc.createApiKey).toHaveBeenCalledWith("user-1", "k")
  })

  it("DELETE 403 when caller is api_key", async () => {
    mockResolveCaller.mockResolvedValue(API_KEY_CALLER)
    const res = await apiKeyRevoke(
      req(`/api/v1/me/api-keys/${KEY_ID}`, { method: "DELETE" }),
      ctx({ id: KEY_ID })
    )
    expect(res.status).toBe(403)
  })

  it("DELETE revokes when session", async () => {
    mockResolveCaller.mockResolvedValue(SESSION_CALLER);
    (apiKeysSvc.revokeApiKey as jest.Mock).mockResolvedValue(undefined)
    const res = await apiKeyRevoke(
      req(`/api/v1/me/api-keys/${KEY_ID}`, { method: "DELETE" }),
      ctx({ id: KEY_ID })
    )
    expect(res.status).toBe(200)
    expect(apiKeysSvc.revokeApiKey).toHaveBeenCalledWith("user-1", KEY_ID)
  })
})
