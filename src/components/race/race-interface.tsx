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
  const [state, setState] = useState<RaceState>("idle");
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [raceStartTime, setRaceStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);

  // Server-authoritative display metrics
  const [localProgress, setLocalProgress] = useState(0);
  const [localWpm, setLocalWpm] = useState(0);
  const [localMistakes, setLocalMistakes] = useState(0);
  const [localCorrectChars, setLocalCorrectChars] = useState(0);

  const [lobbyParticipants, setLobbyParticipants] = useState<LobbyParticipant[]>([]);
  const [raceParticipants, setRaceParticipants] = useState<ParticipantData[]>([]);

  const socketRef = useRef(getSocket());
  const participantIdRef = useRef<string | null>(null);
  participantIdRef.current = participantId;

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
      wpm: number;
      mistakes: number;
      wordIndex: number;
      totalCorrectChars: number;
    }) => {
      if (data.participantId === participantIdRef.current) {
        setLocalProgress(data.progress);
        setLocalWpm(data.wpm);
        setLocalMistakes(data.mistakes);
        setLocalCorrectChars(data.totalCorrectChars);
        setCurrentWordIndex(data.wordIndex);
      }
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

    socket.on("race-complete", (data: { participantId: string; timeSeconds: number; wpm: number }) => {
      if (data.participantId === participantIdRef.current) {
        setState("finished");
        setEndTime(Date.now());
      }
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
        if (response.error) return;
        setParticipantId(response.participantId!);
        setState("lobby");
      }
    );
  }

  const handleGo = useCallback(() => {
    setState("racing");
    setRaceStartTime(Date.now());
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
    setCurrentInput("");
    setCurrentWordIndex((prev) => prev + 1); // optimistic advance; server confirms via race-progress
  }

  const handleInputChange = useCallback(
    (value: string) => {
      setCurrentInput(value);
      if (participantIdRef.current) {
        socketRef.current.emit("keystroke", {
          raceId,
          participantId: participantIdRef.current,
          input: value,
        });
      }
    },
    [raceId]
  );

  function handleReset() {
    setCurrentWordIndex(0);
    setCurrentInput("");
    setStartAt(null);
    setRaceStartTime(null);
    setEndTime(null);
    setTimeExpired(false);
    setLocalProgress(0);
    setLocalWpm(0);
    setLocalMistakes(0);
    setLocalCorrectChars(0);
    setLobbyParticipants([]);
    setRaceParticipants([]);
    setState("idle");
    setParticipantId(null);
  }

  const isRacing = state === "racing";
  return (
    <div className="race-stage">
      <div className={`race-frame${isRacing ? " wide" : ""}`}>
        <span className="corners-bottom" />
        <h2>{raceTitle}</h2>
        <div className="subtitle">
          {/* prettier-ignore */}
          {state === "idle" ? "// ENTER NICKNAME" : state === "lobby" ? "// AWAITING RIDERS" : state === "countdown" ? "// SIGNAL INCOMING" : state === "racing" ? "// BURN THE PROMPT" : "// RUN COMPLETE"}
        </div>

        {state === "idle" && <JoinDialog onJoin={handleJoin} />}

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
              progress={localProgress}
              mistakes={localMistakes}
              wpm={localWpm}
              totalCorrectChars={localCorrectChars}
            />
            <TextDisplay
              words={words}
              currentWordIndex={currentWordIndex}
              completedWords={currentWordIndex}
              currentInput={currentInput}
            />
            <TypingInput
              currentWord={words[currentWordIndex] ?? ""}
              onSubmit={handleWordSubmit}
              onInputChange={handleInputChange}
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
            completedWords={currentWordIndex}
            mistakes={localMistakes}
            startTime={raceStartTime!}
            endTime={endTime!}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
