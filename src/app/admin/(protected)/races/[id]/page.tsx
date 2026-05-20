"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchApi } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-keys"

type Race = {
  id: string;
  title: string;
  text: string;
  status: string;
};

type Participant = {
  id: string;
  nickname: string;
  progress: number;
  mistakes: number;
  totalAttempted: number;
  completedAt: string | null;
  startedAt: string | null;
};

export default function AdminRaceMonitorPage() {
  const params = useParams()
  const id = params.id as string

  const { data: race } = useQuery({
    queryKey: queryKeys.races.detail(id),
    queryFn: () => fetchApi<Race>(`/api/v1/races/${id}`),
  })

  const { data: participants = [] } = useQuery({
    queryKey: queryKeys.participants.byRace(id),
    queryFn: () => fetchApi<Participant[]>(`/api/v1/races/${id}/participants`),
  })

  if (!race) {
    return <p className="text-muted-foreground">
      Loading...
    </p>
  }

  const sorted = [...participants].sort((a, b) => b.progress - a.progress)

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold">
          {race.title}
        </h1>
        <Badge>
          {race.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {participants.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {participants.filter((p) => p.completedAt).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {race.text.split(/\s+/).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {sorted.length === 0 ? (
        <p className="text-muted-foreground">
          No participants yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                Nickname
              </TableHead>
              <TableHead>
                Progress
              </TableHead>
              <TableHead>
                Accuracy
              </TableHead>
              <TableHead>
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((p) => {
              const accuracy =
                p.totalAttempted > 0
                  ? Math.round(
                    ((p.totalAttempted - p.mistakes) / p.totalAttempted) * 100
                  )
                  : 100
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    {p.nickname}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress}
                        className="h-2 w-24" />
                      <span className="text-sm">
                        {p.progress}
                        %
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {accuracy}
                    %
                  </TableCell>
                  <TableCell>
                    {p.completedAt ? (
                      <Badge variant="default">
                        Completed
                      </Badge>
                    ) : p.startedAt ? (
                      <Badge variant="secondary">
                        Racing
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Joined
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
