"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimePicker } from "@/components/ui/time-picker"
import { secondsToMinutesSeconds, minutesSecondsToSeconds } from "@/lib/time-utils"

export default function EditRacePage() {
  const router = useRouter()
  const params = useParams()
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [status, setStatus] = useState("draft")
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchRace() {
      const res = await fetch(`/api/v1/races/${params.id}`)
      if (res.ok) {
        const { data: race } = await res.json()
        setTitle(race.title)
        setText(race.text)
        setStatus(race.status)
        if (race.durationSeconds) {
          const { minutes, seconds } = secondsToMinutesSeconds(race.durationSeconds)
          setDurationMinutes(minutes)
          setDurationSeconds(seconds)
        }
      } else {
        toast.error("Race not found")
        router.push("/admin/races")
      }
      setFetching(false)
    }
    fetchRace()
  }, [params.id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (durationMinutes === 0 && durationSeconds === 0) {
      toast.error("Duration must be greater than 0")
      return
    }

    setLoading(true)

    const totalSeconds = minutesSecondsToSeconds(durationMinutes, durationSeconds)

    const res = await fetch(`/api/v1/races/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, status, durationSeconds: totalSeconds }),
    })

    if (res.ok) {
      toast.success("Race updated")
      router.push("/admin/races")
    } else {
      const data = await res.json()
      toast.error(data.error?.message ?? "Failed to update race")
    }
    setLoading(false)
  }

  if (fetching) {
    return <p style={{ color: "var(--fg-dim)", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 11 }}>
      {"// Loading..."}
    </p>
  }

  return (
    <div>
      <div className="sec-head"
        style={{ marginBottom: 18 }}>
        <span className="kick">
          {"// Edit Build"}
        </span>
        <h2 style={{ margin: 0 }}>
          Edit Race
        </h2>
      </div>
      <div className="form-card chamfer">
        <form onSubmit={handleSubmit}
          className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">
              Race Text
            </Label>
            <Textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              {text.trim() ? text.trim().split(/\s+/).length : 0}
              {' '}
              words
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">
              Status
            </Label>
            <Select value={status}
              onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">
                  Draft
                </SelectItem>
                <SelectItem value="active">
                  Active
                </SelectItem>
                <SelectItem value="completed">
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div title="How long participants have to complete the race"
            className="cursor-help">
            <TimePicker
              label="Duration"
              minutes={durationMinutes}
              seconds={durationSeconds}
              onMinutesChange={setDurationMinutes}
              onSecondsChange={setDurationSeconds}
            />
          </div>
          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/admin/races")}
            >
                Cancel
            </Button>
            <Button type="submit"
              disabled={loading}
              size="lg">
              {loading ? "Saving..." : "Save Changes →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
