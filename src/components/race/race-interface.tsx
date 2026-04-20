"use client";

import { useCallback, useState } from "react";
import { JoinDialog } from "./join-dialog";
import { TextDisplay } from "./text-display";
import { TypingInput } from "./typing-input";
import { ProgressPanel } from "./progress-panel";
import { RaceComplete } from "./race-complete";
import { ParticipantList } from "./participant-list";
import { RaceTimer } from "./race-timer";
import { syncProgress } from "@/lib/race-sync";

type RaceState = "idle" | "joined" | "racing" | "finished";
type WordResult = "correct" | "incorrect";

export function RaceInterface({
  raceId,
  raceTitle,
  raceText,
  durationSeconds,
}: {
  raceId: string;
  raceTitle: string;
  raceText: string;
  durationSeconds: number | null;
}) {
  const words = raceText.split(/\s+/);
  const [state, setState] = useState<RaceState>("idle");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const progress = words.length > 0
    ? Math.round((currentWordIndex / words.length) * 100)
    : 0;
  const mistakes = wordResults.filter((r) => r === "incorrect").length;
  const totalAttempted = wordResults.length;

  const handleTimeExpired = useCallback(() => {
    setTimeExpired(true);
  }, []);

  const handleSyncError = useCallback(
    (error: { message: string }) => {
      if (error.message === "Race time limit exceeded") {
        setTimeExpired(true);
      }
    },
    []
  );

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
      const startedAtDate = new Date(now);
      setStartedAt(startedAtDate);
      syncProgress(raceId, participantId!, {
        progress: 0,
        mistakes: 0,
        totalAttempted: 0,
        startedAt: startedAtDate.toISOString(),
      }, handleSyncError);
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
      }, handleSyncError);
    } else {
      syncProgress(raceId, participantId!, {
        progress: newProgress,
        mistakes: newMistakes,
        totalAttempted: newResults.length,
      }, handleSyncError);
    }
  }

  function handleReset() {
    setCurrentWordIndex(0);
    setWordResults([]);
    setStartTime(null);
    setEndTime(null);
    setState("idle");
    setParticipantId(null);
    setTimeExpired(false);
    setStartedAt(null);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{raceTitle}</h1>

      {state === "idle" && (
        <JoinDialog raceId={raceId} onJoin={handleJoin} />
      )}

      {(state === "joined" || state === "racing") && (
        <div className="space-y-6">
          {durationSeconds && startedAt && (
            <RaceTimer
              durationSeconds={durationSeconds}
              startedAt={startedAt}
              onTimeExpired={handleTimeExpired}
            />
          )}
          {timeExpired && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Time's up! Race has ended.
            </div>
          )}
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
            disabled={timeExpired}
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
