"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { minutesSecondsToSeconds } from "@/lib/time-utils"
import { fetchApi, ApiError } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type Race = {
  id: string;
  title: string;
  status: string;
};

export default function CreateRacePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [status, setStatus] = useState("draft")
  const [durationMinutes, setDurationMinutes] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; text: string; status: string; durationSeconds: number }) =>
      fetchApi<Race>("/api/v1/races", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.races.all() })
      toast.success("Race created")
      router.push("/admin/races")
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Failed to create race")
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (durationMinutes === 0 && durationSeconds === 0) {
      toast.error("Duration must be greater than 0")
      return
    }
    const totalSeconds = minutesSecondsToSeconds(durationMinutes, durationSeconds)
    createMutation.mutate({ title, text, status, durationSeconds: totalSeconds })
  }

  return (
    <div>
      <div className="sec-head"
        style={{ marginBottom: 18 }}>
        <span className="kick">
          {"// New Build"}
        </span>
        <h2 style={{ margin: 0 }}>
          Create Race
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
              placeholder="e.g. Speed Challenge #1"
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
              placeholder="Enter the text that participants will type..."
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
            <Button type="submit"
              disabled={createMutation.isPending}
              size="lg">
              {createMutation.isPending ? "Creating..." : "Create Race →"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}