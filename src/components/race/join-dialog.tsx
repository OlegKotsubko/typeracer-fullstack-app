"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function JoinDialog({
  raceId,
  onJoin,
}: {
  raceId: string;
  onJoin: (participantId: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/races/${raceId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim() }),
    });

    if (res.ok) {
      const participant = await res.json();
      onJoin(participant.id);
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to join race");
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join the Race</CardTitle>
        <CardDescription>
          Enter your name or nickname to start typing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              maxLength={30}
              required
              autoFocus
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Joining..." : "Join Race"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
