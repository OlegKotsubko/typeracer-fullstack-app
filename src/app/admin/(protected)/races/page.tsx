"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Race = {
  id: string;
  title: string;
  text: string;
  status: string;
  createdAt: string;
};

export default function AdminRacesPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/v1/races")
      if (cancelled) return
      if (res.ok) {
        const { data } = await res.json()
        setRaces(data)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  async function handleDelete() {
    if (!deleteId) return
    const res = await fetch(`/api/v1/races/${deleteId}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Race deleted")
      setRaces(races.filter((r) => r.id !== deleteId))
    } else {
      toast.error("Failed to delete race")
    }
    setDeleteId(null)
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return races
    const q = query.toLowerCase()
    return races.filter((r) => r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
  }, [races, query])

  return (
    <div>
      <div className="tbl-head">
        <div className="sec-head"
          style={{ margin: 0 }}>
          <span className="kick">
            {"// Race Roster"}
          </span>
          <h2 style={{ margin: 0 }}>
            Races
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or id..."
            className="chamfer h-9 px-3 bg-black/40 border border-[var(--line)] font-mono
            text-[12px] text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none
            focus:border-[var(--green)] focus:shadow-[0_0_0_3px_rgba(182,255,60,0.15)] transition-shadow"
          />
          <Link href="/admin/races/new">
            <Button>
              + New Race
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 11 }}>
          {"// Loading races..."}
        </p>
      ) : filtered.length === 0 ? (
        <p style={{ color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 11 }}>
          {`// ${query ? "No races match your search" : "No races yet"} — `}
          <Link href="/admin/races/new"
            style={{ color: "var(--green)" }}>
            spin one up
          </Link>
        </p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>
                  ID
                </th>
                <th>
                  Title
                </th>
                <th>
                  Status
                </th>
                <th>
                  Words
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
              {filtered.map((race) => (
                <tr key={race.id}>
                  <td className="id">
                    {race.id.slice(0, 8)}
                  </td>
                  <td className="nm">
                    {race.title}
                  </td>
                  <td>
                    <span className={`st ${race.status}`}>
                      {race.status}
                    </span>
                  </td>
                  <td>
                    {race.text.split(/\s+/).length}
                  </td>
                  <td>
                    {new Date(race.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="acts">
                      <Link href={`/race/${race.id}`}
                        className="lnk">
                        Open
                      </Link>
                      <Link href={`/admin/races/${race.id}/edit`}
                        className="lnk">
                        Edit
                      </Link>
                      <button className="lnk pink"
                        onClick={() => setDeleteId(race.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {"// Delete Race"}
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the race and all participant data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost"
              onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive"
              onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
