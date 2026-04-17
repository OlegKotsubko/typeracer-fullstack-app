import { db } from "@/db";
import { races, participants } from "@/db/schema";
import { count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const allRaces = await db.select().from(races);
  const activeRaces = allRaces.filter((r) => r.status === "active");
  const totalParticipants = await db
    .select({ count: count() })
    .from(participants);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/admin/races/new">
          <Button>Create Race</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Races
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{allRaces.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Races
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeRaces.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalParticipants[0]?.count ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
