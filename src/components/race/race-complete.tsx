"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export function RaceComplete({
  words,
  completedWords,
  mistakes,
  startTime,
  endTime,
  onReset,
}: {
  words: string[];
  completedWords: number;
  mistakes: number;
  startTime: number;
  endTime: number;
  onReset: () => void;
}) {
  const totalTime = (endTime - startTime) / 1000;
  const minutes = totalTime / 60;

  // WPM based on completed characters
  const completedChars = words.slice(0, completedWords).join(" ").length;
  const wpm = minutes > 0 ? Math.round((completedChars / 5) / minutes) : 0;

  const progress = Math.round((completedWords / words.length) * 100);

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Race Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{wpm}</p>
            <p className="text-sm text-muted-foreground">WPM</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{progress}%</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{totalTime.toFixed(1)}s</p>
            <p className="text-sm text-muted-foreground">Time</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {mistakes}
            </p>
            <p className="text-sm text-muted-foreground">Mistakes</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={onReset} className="w-full">
            Race Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}