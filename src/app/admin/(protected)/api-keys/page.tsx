"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealToken, setRevealToken] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/v1/me/api-keys");
      if (cancelled) return;
      if (res.ok) {
        const { data } = await res.json();
        setKeys(data);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const res = await fetch("/api/v1/me/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setKeys((prev) => [{ id: data.id, name: data.name, prefix: data.prefix, lastUsedAt: null, revokedAt: null, createdAt: data.createdAt }, ...prev]);
      setRevealToken(data.token);
      setName("");
    } else {
      const data = await res.json();
      toast.error(data.error?.message ?? "Failed to create API key");
    }
    setCreating(false);
  }

  async function handleRevoke() {
    if (!revokeId) return;
    const res = await fetch(`/api/v1/me/api-keys/${revokeId}`, { method: "DELETE" });
    if (res.ok) {
      const now = new Date().toISOString();
      setKeys((prev) => prev.map((k) => k.id === revokeId ? { ...k, revokedAt: now } : k));
      toast.success("API key revoked");
    } else {
      toast.error("Failed to revoke API key");
    }
    setRevokeId(null);
  }

  function handleCopy() {
    if (!revealToken) return;
    navigator.clipboard.writeText(revealToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="sec-head" style={{ marginBottom: 18 }}>
        <span className="kick">{"// New Key"}</span>
        <h2 style={{ margin: 0 }}>Generate API Key</h2>
      </div>
      <div className="form-card chamfer" style={{ marginBottom: 32 }}>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CI Pipeline"
              required
            />
          </div>
          <div className="form-actions">
            <Button type="submit" disabled={creating} size="lg">
              {creating ? "Generating..." : "Generate →"}
            </Button>
          </div>
        </form>
      </div>

      <div className="tbl-head">
        <div className="sec-head" style={{ margin: 0 }}>
          <span className="kick">{"// Key Roster"}</span>
          <h2 style={{ margin: 0 }}>API Keys</h2>
        </div>
      </div>

      {loading ? (
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
                <th>Name</th>
                <th>Prefix</th>
                <th>Status</th>
                <th>Last Used</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td className="nm">{k.name}</td>
                  <td className="id">{k.prefix}…</td>
                  <td>
                    <span className={`st ${k.revokedAt ? "completed" : "active"}`}>
                      {k.revokedAt ? "revoked" : "active"}
                    </span>
                  </td>
                  <td>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "—"}</td>
                  <td>{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="acts">
                      {!k.revokedAt && (
                        <button className="lnk pink" onClick={() => setRevokeId(k.id)}>
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

      <Dialog open={!!revealToken} onOpenChange={() => setRevealToken(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"// Key Generated"}</DialogTitle>
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
            <Button variant="ghost" onClick={() => setRevealToken(null)}>
              Close
            </Button>
            <Button onClick={handleCopy}>
              {copied ? "Copied!" : "Copy →"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{"// Revoke Key"}</DialogTitle>
            <DialogDescription>
              This will permanently revoke the key. Any integrations using it will stop working.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke}>
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
