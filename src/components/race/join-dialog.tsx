"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

export function JoinDialog({
  onJoinAction,
}: {
  onJoinAction: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nickname.trim()) return
    onJoinAction(nickname.trim())
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="nickname">
            Nickname
        </label>
        <input
          id="nickname"
          className="chamfer h-10 px-3 bg-black/40 border border-neon-line font-mono text-[14px]
           text-(--fg) placeholder:text-(--color-muted-foreground) focus:outline-none focus:border-neon-green
           focus:shadow-[0_0_0_3px_rgba(182,255,60,0.15)] transition-shadow"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="streetsamurai_07"
          maxLength={30}
          required
          autoFocus
        />
      </div>
      <Button type="submit"
        size="lg"
        className="w-full">
        Join the lobby →
      </Button>
    </form>
  )
}
