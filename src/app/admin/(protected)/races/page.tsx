"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Race = {
  id: string;
  title: string;
  text: string;
  status: string;
  createdAt: string;
};

export default function AdminRacesPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRaces() {
    const res = await fetch("/api/races");
    if (res.ok) {
      setRaces(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRaces();
  }, []);

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/races/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Race deleted");
      setRaces(races.filter((r) => r.id !== deleteId));
    } else {
      toast.error("Failed to delete race");
    }
    setDeleteId(null);
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default" as const;
      case "draft":
        return "secondary" as const;
      case "completed":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading races...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Races</h1>
        <Link href="/admin/races/new">
          <Button>Create Race</Button>
        </Link>
      </div>

      {races.length === 0 ? (
        <p className="text-muted-foreground">
          No races yet.{" "}
          <Link href="/admin/races/new" className="underline">
            Create one
          </Link>
          .
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {races.map((race) => (
              <TableRow key={race.id}>
                <TableCell className="font-medium">{race.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(race.status)}>
                    {race.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {race.text.split(/\s+/).length} words
                </TableCell>
                <TableCell>
                  {new Date(race.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/races/${race.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(race.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Race</DialogTitle>
            <DialogDescription>
              This will permanently delete the race and all participant data.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
