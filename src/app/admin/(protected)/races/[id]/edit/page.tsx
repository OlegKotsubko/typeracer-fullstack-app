"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function EditRacePage() {
  const router = useRouter();
  const params = useParams();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function fetchRace() {
      const res = await fetch(`/api/races/${params.id}`);
      if (res.ok) {
        const race = await res.json();
        setTitle(race.title);
        setText(race.text);
        setStatus(race.status);
      } else {
        toast.error("Race not found");
        router.push("/admin/races");
      }
      setFetching(false);
    }
    fetchRace();
  }, [params.id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/races/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, status }),
    });

    if (res.ok) {
      toast.success("Race updated");
      router.push("/admin/races");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Failed to update race");
    }
    setLoading(false);
  }

  if (fetching) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Race</h1>
      <Card>
        <CardHeader>
          <CardTitle>Race Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="text">Race Text</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                {text.trim() ? text.trim().split(/\s+/).length : 0} words
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => v && setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/races")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
