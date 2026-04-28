"use client";

import { Button } from "@/components/ui/button";
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

  const completedChars = words.slice(0, completedWords).join(" ").length;
  const wpm = minutes > 0 ? Math.round((completedChars / 5) / minutes) : 0;
  const progress = Math.round((completedWords / words.length) * 100);
  const totalAttempted = completedChars + mistakes;
  const accuracy = totalAttempted > 0 ? Math.round((completedChars / totalAttempted) * 100) : 100;

  return (
    <div className="finish">
      <h3 style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}>// Race Complete</h3>
      <div className="finish-grid">
        <div className="finish-cell">
          <div className="k">WPM</div>
          <div className="v">{wpm}</div>
        </div>
        <div className="finish-cell">
          <div className="k">Accuracy</div>
          <div className="v">{accuracy}%</div>
        </div>
        <div className="finish-cell">
          <div className="k">Progress</div>
          <div className="v">{progress}%</div>
        </div>
        <div className="finish-cell">
          <div className="k">Mistakes</div>
          <div className="v pink">{mistakes}</div>
        </div>
      </div>
      <div className="finish-actions">
        <Button onClick={onReset} size="lg" className="flex-1">Restart</Button>
        <Link href="/" className="flex-1">
          <Button variant="ghost" size="lg" className="w-full">Back Home</Button>
        </Link>
      </div>
    </div>
  );
}
