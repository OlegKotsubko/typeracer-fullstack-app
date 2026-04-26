"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { JoinDialog } from "./join-dialog";
import { RaceLobby } from "./race-lobby";
import { TrafficLight } from "./traffic-light";
import { TextDisplay } from "./text-display";
import { TypingInput } from "./typing-input";
import { ProgressPanel } from "./progress-panel";
import { RaceComplete } from "./race-complete";
import { ParticipantList, ParticipantData } from "./participant-list";
import { RaceTimer } from "./race-timer";
import { calculateWpm } from "@/lib/typing-logic";
import { getSocket } from "@/lib/socket";

type RaceState = "idle" | "lobby" | "countdown" | "racing" | "finished";

type LobbyParticipant = {
  id: string;
  nickname: string;
};

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
  const [currentInput, setCurrentInput] = useState("");
  const [completedWords, setCompletedWords] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [wpm, setWpm] = useState(0);

  // Lobby participants (from socket events)
  const [lobbyParticipants, setLobbyParticipants] = useState<LobbyParticipant[]>([]);

  // Race participants (progress data for all players)
  const [raceParticipants, setRaceParticipants] = useState<ParticipantData[]>([]);

  const socketRef = useRef(getSocket());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live WPM calculation
  useEffect(() => {
    if (state !== "racing" || !raceStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - raceStartTime;
      setWpm(calculateWpm(totalCorrectChars, elapsed));
    }, 1000);

    return () => clearInterval(interval);
  }, [state, raceStartTime, totalCorrectChars]);

  // Socket.io event listeners
  useEffect(() => {
    const socket = socketRef.current;
    socket.connect();

    socket.on("participant-joined", (data: { participants: LobbyParticipant[]; slots: number }) => {
      setLobbyParticipants(data.participants);
    });

    socket.on("race-starting", (data: { startAt: string }) => {
      setStartAt(new Date(data.startAt));
      setState("countdown");
    });

    socket.on("race-progress", (data: {
      participantId: string;
      progress: number;
      mistakes: number;
      totalAttempted: number;
      wpm: number;
    }) => {
      setRaceParticipants((prev) => {
        const existing = prev.find((p) => p.id === data.participantId);
        if (existing) {
          return prev.map((p) =>
            p.id === data.participantId
              ? { ...p, progress: data.progress, wpm: data.wpm }
              : p
          );
        }
        return prev;
      });
    });

    socket.on("participant-completed", (data: { participantId: string; completedAt: string }) => {
      setRaceParticipants((prev) =>
        prev.map((p) =>
          p.id === data.participantId
            ? { ...p, progress: 100, completedAt: data.completedAt }
            : p
        )
      );
    });

    socket.on("participant-left", (data: { participants: LobbyParticipant[] }) => {
      setLobbyParticipants(data.participants);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  function handleJoin(nickname: string) {
    const socket = socketRef.current;
    socket.emit(
      "join-race",
      { raceId, nickname },
      (response: { participantId?: string; error?: string }) => {
        if (response.error) {
          return;
        }
        setParticipantId(response.participantId!);
        setState("lobby");
      }
    );
  }

  const handleGo = useCallback(() => {
    setState("racing");
    const now = Date.now();
    setRaceStartTime(now);

    // Initialize race participants from lobby participants
    setRaceParticipants(
      lobbyParticipants.map((p) => ({
        id: p.id,
        nickname: p.nickname,
        progress: 0,
        wpm: 0,
        completedAt: null,
      }))
    );
  }, [lobbyParticipants]);

  const handleTimeExpired = useCallback(() => {
    setTimeExpired(true);
    setState("finished");
    setEndTime(Date.now());
  }, []);

  function sendProgressUpdate(progress: number, currentMistakes: number, currentWpm: number) {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      socketRef.current.emit("progress-update", {
        raceId,
        participantId,
        progress,
        mistakes: currentMistakes,
        totalAttempted: completedWords + (currentInput.length > 0 ? 1 : 0),
        wpm: currentWpm,
      });
    }, 300);
  }

  function handleWordSubmit() {
    const newCompletedWords = completedWords + 1;
    const newCorrectChars = totalCorrectChars + words[currentWordIndex].length;
    const newIndex = currentWordIndex + 1;
    const newProgress = Math.round((newCompletedWords / words.length) * 100);

    setCompletedWords(newCompletedWords);
    setTotalCorrectChars(newCorrectChars);
    setCurrentWordIndex(newIndex);
    setCurrentInput("");

    const elapsed = Date.now() - (raceStartTime ?? Date.now());
    const currentWpm = calculateWpm(newCorrectChars, elapsed);
    setWpm(currentWpm);

    // Update own progress in participants list
    setRaceParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? { ...p, progress: newProgress, wpm: currentWpm }
          : p
      )
    );

    if (newCompletedWords >= words.length) {
      // Race complete
      const now = Date.now();
      setEndTime(now);
      setState("finished");

      // Cancel any pending debounced update
      if (debounceRef.current) clearTimeout(debounceRef.current);

      const timeSeconds = parseFloat(
        ((now - (raceStartTime ?? now)) / 1000).toFixed(1)
      );
      socketRef.current.emit("race-complete", {
        raceId,
        participantId,
        timeSeconds,
        wpm: currentWpm,
      });
    } else {
      sendProgressUpdate(newProgress, mistakes, currentWpm);
    }
  }

  function handleMistake() {
    setMistakes((prev) => prev + 1);
  }

  const handleInputChange = useCallback((value: string) => {
    setCurrentInput(value);
  }, []);

  function handleReset() {
    setCurrentWordIndex(0);
    setCurrentInput("");
    setCompletedWords(0);
    setMistakes(0);
    setTotalCorrectChars(0);
    setStartAt(null);
    setRaceStartTime(null);
    setEndTime(null);
    setTimeExpired(false);
    setWpm(0);
    setLobbyParticipants([]);
    setRaceParticipants([]);
    setState("idle");
    setParticipantId(null);
  }

  const progress = words.length > 0
    ? Math.round((completedWords / words.length) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{raceTitle}</h1>

      {state === "idle" && (
        <JoinDialog onJoin={handleJoin} />
      )}

      {state === "lobby" && (
        <RaceLobby participants={lobbyParticipants} slots={3} />
      )}

      {state === "countdown" && startAt && (
        <TrafficLight startAt={startAt} onGo={handleGo} />
      )}

      {state === "racing" && (
        <div className="space-y-6">
          {durationSeconds && startAt && (
            <RaceTimer
              durationSeconds={durationSeconds}
              startAt={startAt}
              onTimeExpired={handleTimeExpired}
            />
          )}
          <ProgressPanel
            progress={progress}
            mistakes={mistakes}
            wpm={wpm}
          />
          <TextDisplay
            words={words}
            currentWordIndex={currentWordIndex}
            completedWords={completedWords}
            currentInput={currentInput}
          />
          <TypingInput
            currentWord={words[currentWordIndex] ?? ""}
            onSubmit={handleWordSubmit}
            onInputChange={handleInputChange}
            onMistake={handleMistake}
            disabled={timeExpired}
          />
          <ParticipantList
            participants={raceParticipants}
            currentParticipantId={participantId}
          />
        </div>
      )}

      {state === "finished" && (
        <RaceComplete
          words={words}
          completedWords={completedWords}
          mistakes={mistakes}
          startTime={raceStartTime!}
          endTime={endTime!}
          onReset={handleReset}
        />
      )}
    </div>
  );
}