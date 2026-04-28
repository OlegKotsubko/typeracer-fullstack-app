"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JoinDialog } from "./join-dialog";
import { RaceLobby } from "./race-lobby";
import { TrafficLight } from "./traffic-light";
import { TextDisplay } from "./text-display";
import { TypingInput } from "./typing-input";
import { ProgressPanel } from "./progress-panel";
import { RaceComplete } from "./race-complete";
import { ParticipantList, ParticipantData } from "./participant-list";
import { RaceTimer } from "./race-timer";
import { calculateWpm, validateInput } from "@/lib/typing-logic";
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
  const words = useMemo(() => raceText.split(/\s+/), [raceText]);
  const totalChars = words.reduce((sum, w) => sum + w.length, 0);
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
  const latestRef = useRef({ totalCorrectChars, currentWordIndex, raceStartTime, mistakes, participantId });
  latestRef.current = { totalCorrectChars, currentWordIndex, raceStartTime, mistakes, participantId };

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

  function handleWordSubmit() {
    const newCompletedWords = completedWords + 1;
    const newCorrectChars = totalCorrectChars + words[currentWordIndex].length;
    const newIndex = currentWordIndex + 1;
    const newProgress = totalChars > 0 ? Math.round((newCorrectChars / totalChars) * 100) : 0;

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
      const now = Date.now();
      setEndTime(now);
      setState("finished");

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
      // Cancel any pending debounced update and emit immediately with correct new values
      if (debounceRef.current) clearTimeout(debounceRef.current);
      socketRef.current.emit("progress-update", {
        raceId,
        participantId,
        progress: newProgress,
        mistakes,
        totalAttempted: newCorrectChars,
        wpm: currentWpm,
      });
    }
  }

  function handleMistake() {
    setMistakes((prev) => prev + 1);
  }

  const handleInputChange = useCallback((value: string) => {
    setCurrentInput(value);

    const { totalCorrectChars, currentWordIndex, raceStartTime, mistakes, participantId } = latestRef.current;
    const correctChars = validateInput(value, words[currentWordIndex] ?? "").filter(
      (c) => c.status === "correct"
    ).length;
    const newProgress = totalChars > 0 ? Math.round(((totalCorrectChars + correctChars) / totalChars) * 100) : 0;

    setRaceParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, progress: newProgress } : p
      )
    );

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const elapsed = Date.now() - (raceStartTime ?? Date.now());
      const currentWpm = calculateWpm(totalCorrectChars + correctChars, elapsed);
      socketRef.current.emit("progress-update", {
        raceId,
        participantId,
        progress: newProgress,
        mistakes,
        totalAttempted: totalCorrectChars + correctChars,
        wpm: currentWpm,
      });
    }, 300);
  }, [words, totalChars, raceId]);

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

  const correctCharsInCurrentInput = validateInput(currentInput, words[currentWordIndex] ?? "").filter(
    (c) => c.status === "correct"
  ).length;
  const progress = totalChars > 0
    ? Math.round(((totalCorrectChars + correctCharsInCurrentInput) / totalChars) * 100)
    : 0;

  const isRacing = state === "racing";
  return (
    <div className="race-stage">
      <div className={`race-frame${isRacing ? " wide" : ""}`}>
        <span className="corners-bottom" />
        <h2>{raceTitle}</h2>
        <div className="subtitle">// {state === "idle" ? "ENTER NICKNAME" : state === "lobby" ? "AWAITING RIDERS" : state === "countdown" ? "SIGNAL INCOMING" : state === "racing" ? "BURN THE PROMPT" : "RUN COMPLETE"}</div>

        {state === "idle" && (
          <JoinDialog onJoin={handleJoin} />
        )}

        {state === "lobby" && (
          <RaceLobby participants={lobbyParticipants} slots={3} currentParticipantId={participantId} />
        )}

        {state === "countdown" && startAt && (
          <TrafficLight startAt={startAt} onGo={handleGo} />
        )}

        {state === "racing" && (
          <>
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
              totalCorrectChars={totalCorrectChars + correctCharsInCurrentInput}
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
          </>
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
    </div>
  );
}
