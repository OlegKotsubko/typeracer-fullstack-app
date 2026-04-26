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

export function JoinDialog({
  onJoin,
}: {
  onJoin: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    onJoin(nickname.trim());
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join the Race</CardTitle>
        <CardDescription>
          Enter your nickname to join the lobby
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
          <Button type="submit">
            Join Race
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}