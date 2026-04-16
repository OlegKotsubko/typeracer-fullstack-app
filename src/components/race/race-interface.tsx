"use client";

import { useState } from "react";
import { JoinDialog } from "./join-dialog";
import { TextDisplay } from "./text-display";
import { TypingInput } from "./typing-input";
import { ProgressPanel } from "./progress-panel";
import { RaceComplete } from "./race-complete";
import { ParticipantList } from "./participant-list";
import { syncProgress } from "@/lib/race-sync";

type RaceState = "idle" | "joined" | "racing" | "finished";
type WordResult = "correct" | "incorrect";

export function RaceInterface({
  raceId,
  raceTitle,
  raceText,
}: {
  raceId: string;
  raceTitle: string;
  raceText: string;
}) {
  const words = raceText.split(/\s+/);
  const [state, setState] = useState<RaceState>("idle");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const progress = words.length > 0
    ? Math.round((currentWordIndex / words.length) * 100)
    : 0;
  const mistakes = wordResults.filter((r) => r === "incorrect").length;
  const totalAttempted = wordResults.length;

  function handleJoin(id: string) {
    setParticipantId(id);
    setState("joined");
  }

  function handleWordSubmit(typed: string) {
    const now = Date.now();

    // Start racing on first word submission
    if (state === "joined") {
      setState("racing");
      setStartTime(now);
      syncProgress(raceId, participantId!, {
        progress: 0,
        mistakes: 0,
        totalAttempted: 0,
        startedAt: new Date(now).toISOString(),
      });
    }

    const isCorrect = typed === words[currentWordIndex];
    const newResults: WordResult[] = [...wordResults, isCorrect ? "correct" : "incorrect"];
    const newIndex = currentWordIndex + 1;
    const newMistakes = newResults.filter((r) => r === "incorrect").length;
    const newProgress = Math.round((newIndex / words.length) * 100);

    setWordResults(newResults);
    setCurrentWordIndex(newIndex);

    // Check if race is finished
    if (newIndex >= words.length) {
      setEndTime(now);
      setState("finished");
      syncProgress(raceId, participantId!, {
        progress: 100,
        mistakes: newMistakes,
        totalAttempted: newResults.length,
        completedAt: new Date(now).toISOString(),
      });
    } else {
      syncProgress(raceId, participantId!, {
        progress: newProgress,
        mistakes: newMistakes,
        totalAttempted: newResults.length,
      });
    }
  }

  function handleReset() {
    setCurrentWordIndex(0);
    setWordResults([]);
    setStartTime(null);
    setEndTime(null);
    setState("idle");
    setParticipantId(null);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{raceTitle}</h1>

      {state === "idle" && (
        <JoinDialog raceId={raceId} onJoin={handleJoin} />
      )}

      {(state === "joined" || state === "racing") && (
        <div className="space-y-6">
          <ProgressPanel
            progress={progress}
            mistakes={mistakes}
            totalAttempted={totalAttempted}
            startTime={startTime}
          />
          <TextDisplay
            words={words}
            currentWordIndex={currentWordIndex}
            wordResults={wordResults}
          />
          <TypingInput
            currentWord={words[currentWordIndex] ?? ""}
            isLastWord={currentWordIndex === words.length - 1}
            onSubmit={handleWordSubmit}
          />
          <ParticipantList raceId={raceId} />
        </div>
      )}

      {state === "finished" && (
        <RaceComplete
          words={words}
          wordResults={wordResults}
          startTime={startTime!}
          endTime={endTime!}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
