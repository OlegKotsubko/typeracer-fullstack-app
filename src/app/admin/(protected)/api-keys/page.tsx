"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchApi, ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

type CreatedKey = ApiKey & { token: string };

export default function AdminApiKeysPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [revealToken, setRevealToken] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { data: keys = [], isLoading } = useQuery({
    queryKey: queryKeys.apiKeys.list(),
    queryFn: () => fetchApi<ApiKey[]>("/api/v1/me/api-keys"),
  })

  const createMutation = useMutation({
    mutationFn: (keyName: string) =>
      fetchApi<CreatedKey>("/api/v1/me/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all() })
      setRevealToken(data.token)
      setName("")
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create API key")
    },
  })

  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ id: string }>(`/api/v1/me/api-keys/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all() })
      toast.success("API key revoked")
      setRevokeId(null)
    },
    onError: () => {
      toast.error("Failed to revoke API key")
      setRevokeId(null)
    },
  })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createMutation.mutate(name.trim())
  }

  function handleRevoke() {
    if (!revokeId) return
    revokeMutation.mutate(revokeId)
  }

  function handleCopy() {
    if (!revealToken) return
    navigator.clipboard.writeText(revealToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="sec-head"
        style={{ marginBottom: 18 }}>
        <span className="kick">
          {"// New Key"}
        </span>
        <h2 style={{ margin: 0 }}>
          Generate API Key
        </h2>
      </div>
      <div className="form-card chamfer"
        style={{ marginBottom: 32 }}>
        <form onSubmit={handleCreate}
          className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="key-name">
              Key Name
            </Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CI Pipeline"
              required
            />
          </div>
          <div className="form-actions">
            <Button type="submit"
              disabled={createMutation.isPending}
              size="lg">
              {createMutation.isPending ? "Generating..." : "Generate →"}
            </Button>
          </div>
        </form>
      </div>

      <div className="tbl-head">
        <div className="sec-head"
          style={{ margin: 0 }}>
          <span className="kick">
            {"// Key Roster"}
          </span>
          <h2 style={{ margin: 0 }}>
            API Keys
          </h2>
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 11 }}>
          {"// Loading keys..."}
        </p>
      ) : keys.length === 0 ? (
        <p style={{ color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 11 }}>
          {"// No keys yet — generate one above"}
        </p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>
                  Name
                </th>
                <th>
                  Prefix
                </th>
                <th>
                  Status
                </th>
                <th>
                  Last Used
                </th>
                <th>
                  Created
                </th>
                <th style={{ textAlign: "right" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="nm">
                    {k.name}
                  </td>
                  <td className="id">
                    {k.prefix}
                    …
                  </td>
                  <td>
                    <span className={`st ${k.revokedAt ? "completed" : "active"}`}>
                      {k.revokedAt ? "revoked" : "active"}
                    </span>
                  </td>
                  <td>
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    {new Date(k.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="acts">
                      {!k.revokedAt && (
                        <button className="lnk pink"
                          onClick={() => setRevokeId(k.id)}>
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!revealToken}
        onOpenChange={() => setRevealToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {"// Key Generated"}
            </DialogTitle>
            <DialogDescription>
              Copy your API key now — it will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 4,
              padding: "12px 14px",
              fontFamily: "monospace",
              fontSize: 13,
              wordBreak: "break-all",
              color: "var(--green)",
            }}
          >
            {revealToken}
          </div>
          <DialogFooter>
            <Button variant="ghost"
              onClick={() => setRevealToken(null)}>
              Close
            </Button>
            <Button onClick={handleCopy}>
              {copied ? "Copied!" : "Copy →"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeId}
        onOpenChange={() => setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {"// Revoke Key"}
            </DialogTitle>
            <DialogDescription>
              This will permanently revoke the key. Any integrations using it will stop working.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost"
              onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button variant="destructive"
              onClick={handleRevoke}
              disabled={revokeMutation.isPending}>
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}