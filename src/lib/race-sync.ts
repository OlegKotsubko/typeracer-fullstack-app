let timeoutId: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;

export function syncProgress(
  raceId: string,
  participantId: string,
  data: {
    progress: number;
    mistakes: number;
    totalAttempted: number;
    startedAt?: string;
    completedAt?: string;
  }
) {
  if (timeoutId) clearTimeout(timeoutId);
  if (abortController) abortController.abort();

  // If completed, send immediately
  if (data.completedAt) {
    sendUpdate(raceId, participantId, data);
    return;
  }

  timeoutId = setTimeout(() => {
    sendUpdate(raceId, participantId, data);
  }, 300);
}

function sendUpdate(
  raceId: string,
  participantId: string,
  data: Record<string, unknown>
) {
  abortController = new AbortController();
  fetch(`/api/races/${raceId}/participants/${participantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: abortController.signal,
  }).catch(() => {
    // Silently ignore aborted requests
  });
}
