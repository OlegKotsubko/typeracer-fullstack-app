import { NextResponse } from "next/server"

const spec = {
  openapi: "3.1.0",
  info: {
    title: "TypeRacer API",
    version: "1.0.0",
    // eslint-disable-next-line max-len
    description: "Versioned REST API for TypeRacer. Supports session (cookie) auth from the web UI and `Authorization: Bearer tr_live_...` API keys for third-party clients.",
  },
  servers: [{ url: "/api/v1" }],
  security: [{ bearerAuth: [] }, { sessionCookie: [] }],
  tags: [
    { name: "races" },
    { name: "participants" },
    { name: "winners" },
    { name: "me" },
    { name: "api-keys" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "tr_live_*",
      },
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "better-auth.session_token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
              details: {},
            },
          },
        },
      },
      Race: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string" },
          text: { type: "string" },
          status: {
            type: "string",
            enum: ["draft", "active", "ongoing", "completed"],
          },
          durationSeconds: { type: "integer", nullable: true },
          startAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RaceCreate: {
        type: "object",
        required: ["title", "text"],
        properties: {
          title: { type: "string", minLength: 1 },
          text: { type: "string", minLength: 1 },
          status: {
            type: "string",
            enum: ["draft", "active", "ongoing", "completed"],
          },
          durationSeconds: {
            type: "integer",
            minimum: 1,
            nullable: true,
          },
        },
      },
      RaceUpdate: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1 },
          text: { type: "string", minLength: 1 },
          status: {
            type: "string",
            enum: ["draft", "active", "ongoing", "completed"],
          },
          durationSeconds: {
            type: "integer",
            minimum: 1,
            nullable: true,
          },
        },
      },
      Participant: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          raceId: { type: "string", format: "uuid" },
          nickname: { type: "string" },
          progress: { type: "number" },
          mistakes: { type: "integer" },
          totalAttempted: { type: "integer" },
          wpm: { type: "number" },
          startedAt: { type: "string", format: "date-time", nullable: true },
          completedAt: { type: "string", format: "date-time", nullable: true },
          joinedAt: { type: "string", format: "date-time" },
        },
      },
      ParticipantJoin: {
        type: "object",
        required: ["nickname"],
        properties: { nickname: { type: "string", minLength: 1 } },
      },
      ParticipantProgress: {
        type: "object",
        properties: {
          progress: { type: "number", minimum: 0, maximum: 100 },
          mistakes: { type: "integer", minimum: 0 },
          totalAttempted: { type: "integer", minimum: 0 },
          wpm: { type: "number", minimum: 0 },
          startedAt: { type: "string", format: "date-time" },
          completedAt: { type: "string", format: "date-time" },
        },
      },
      Winner: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          nickname: { type: "string" },
          raceTitle: { type: "string" },
          timeSeconds: { type: "integer" },
          wpm: { type: "number" },
          completedAt: { type: "string", format: "date-time" },
        },
      },
      Plan: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          limits: {
            type: "object",
            properties: {
              racesPerDay: { type: "integer" },
              apiRequestsPerMinute: { type: "integer" },
              maxParticipantsPerRace: { type: "integer" },
            },
          },
        },
      },
      Me: {
        type: "object",
        properties: {
          userId: { type: "string" },
          source: { type: "string", enum: ["session", "api_key"] },
          plan: { $ref: "#/components/schemas/Plan" },
        },
      },
      ApiKey: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          prefix: { type: "string" },
          lastUsedAt: { type: "string", format: "date-time", nullable: true },
          revokedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      ApiKeyCreated: {
        allOf: [
          { $ref: "#/components/schemas/ApiKey" },
          {
            type: "object",
            required: ["token"],
            properties: {
              token: {
                type: "string",
                description: "Plaintext token, shown once. Store it securely.",
              },
            },
          },
        ],
      },
    },
    responses: {
      Error: {
        description: "Error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
    parameters: {
      RaceId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      ParticipantId: {
        name: "participantId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      ApiKeyId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    },
  },
  paths: {
    "/races": {
      get: {
        tags: ["races"],
        summary: "List races",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Race" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["races"],
        summary: "Create race",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RaceCreate" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Race" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
          "401": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/races/{id}": {
      parameters: [{ $ref: "#/components/parameters/RaceId" }],
      get: {
        tags: ["races"],
        summary: "Get race",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Race" } },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
      patch: {
        tags: ["races"],
        summary: "Update race",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RaceUpdate" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Race" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Error" },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
      delete: {
        tags: ["races"],
        summary: "Delete race",
        responses: {
          "200": { description: "Deleted" },
          "401": { $ref: "#/components/responses/Error" },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/races/{id}/participants": {
      parameters: [{ $ref: "#/components/parameters/RaceId" }],
      get: {
        tags: ["participants"],
        summary: "List participants",
        security: [],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Participant" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["participants"],
        summary: "Join race",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParticipantJoin" },
            },
          },
        },
        responses: {
          "201": {
            description: "Joined",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Participant" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
          "404": { $ref: "#/components/responses/Error" },
          "409": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/races/{id}/participants/{participantId}": {
      parameters: [
        { $ref: "#/components/parameters/RaceId" },
        { $ref: "#/components/parameters/ParticipantId" },
      ],
      patch: {
        tags: ["participants"],
        summary: "Update participant progress",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ParticipantProgress" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Participant" },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/Error" },
          "409": { $ref: "#/components/responses/Error" },
        },
      },
      delete: {
        tags: ["participants"],
        summary: "Leave race",
        security: [],
        responses: {
          "200": { description: "Left" },
          "404": { $ref: "#/components/responses/Error" },
          "409": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/winners": {
      get: {
        tags: ["winners"],
        summary: "Top winners (leaderboard)",
        security: [],
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Winner" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        tags: ["me"],
        summary: "Current caller (user + plan)",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { data: { $ref: "#/components/schemas/Me" } },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/me/api-keys": {
      get: {
        tags: ["api-keys"],
        summary: "List API keys (session only)",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ApiKey" },
                    },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Error" },
          "403": { $ref: "#/components/responses/Error" },
        },
      },
      post: {
        tags: ["api-keys"],
        summary: "Create API key (session only)",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: { name: { type: "string", minLength: 1 } },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created. The plaintext token is returned once.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/ApiKeyCreated" },
                  },
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/Error" },
          "403": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/me/api-keys/{id}": {
      parameters: [{ $ref: "#/components/parameters/ApiKeyId" }],
      delete: {
        tags: ["api-keys"],
        summary: "Revoke API key (session only)",
        security: [{ sessionCookie: [] }],
        responses: {
          "200": { description: "Revoked" },
          "401": { $ref: "#/components/responses/Error" },
          "403": { $ref: "#/components/responses/Error" },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
}

export function GET() {
  return NextResponse.json(spec)
}
