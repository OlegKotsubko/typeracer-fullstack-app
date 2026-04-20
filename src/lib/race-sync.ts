let timeoutId: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;
let onTimeLimitExceeded: (() => void) | null = null;

export function syncProgress(
  raceId: string,
  participantId: string,
  data: {
    progress: number;
    mistakes: number;
    totalAttempted: number;
    startedAt?: string;
    completedAt?: string;
  },
  onError?: (error: { message: string }) => void
) {
  if (timeoutId) clearTimeout(timeoutId);
  if (abortController) abortController.abort();

  // If completed, send immediately
  if (data.completedAt) {
    sendUpdate(raceId, participantId, data, onError);
    return;
  }

  timeoutId = setTimeout(() => {
    sendUpdate(raceId, participantId, data, onError);
  }, 300);
}

function sendUpdate(
  raceId: string,
  participantId: string,
  data: Record<string, unknown>,
  onError?: (error: { message: string }) => void
) {
  abortController = new AbortController();
  fetch(`/api/races/${raceId}/participants/${participantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: abortController.signal,
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((body) => {
          if (res.status === 400 && body.error === "Race time limit exceeded") {
            onError?.({ message: body.error });
          }
        });
      }
    })
    .catch(() => {
      // Silently ignore aborted requests
    });
}
