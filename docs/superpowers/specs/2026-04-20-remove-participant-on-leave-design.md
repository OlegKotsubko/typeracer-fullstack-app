# Remove Participant on Race Leave

**Date:** 2026-04-20

## Problem

When a user leaves an active race (closes the tab, manually changes the URL, or clicks a link to another page), their participant record persists in the database indefinitely. This causes ghost participants to appear in the live leaderboard for other racers.

## Intended Outcome

Delete the participant record when a user navigates away from an active race, regardless of whether they finished typing. Removal only applies while the race is active (`status = 'active'`).

## Approach

Client-side cleanup using `keepalive` fetch — no schema changes required.

---

## API Changes

**File:** `src/app/api/races/[id]/participants/[participantId]/route.ts`

Add a `DELETE` handler:

- No authentication required (participantId UUID is unguessable)
- Verify race exists and has `status = 'active'`; return `404` if not
- Delete the participant row
- Return `204 No Content`

---

## Client-side Changes

**File:** `src/components/race/race-interface.tsx`

Add a `useEffect` that activates once `participantId` is set (after the user joins).

```
useEffect(() => {
  if (!participantId) return;

  const deleteUrl = `/api/races/${raceId}/participants/${participantId}`;
  let hasSentLeave = false;

  const sendLeave = (keepalive: boolean) => {
    if (hasSentLeave) return;
    hasSentLeave = true;
    fetch(deleteUrl, { method: 'DELETE', keepalive });
  };

  const handlePageHide = () => sendLeave(true);   // tab close, hard nav
  window.addEventListener('pagehide', handlePageHide);

  return () => {
    window.removeEventListener('pagehide', handlePageHide);
    sendLeave(false);  // SPA navigation (link clicks, router.push)
  };
}, [participantId, raceId]);
```

**Coverage:**
| Scenario | Mechanism |
|---|---|
| Close tab | `pagehide` + `keepalive: true` |
| Change URL in address bar | `pagehide` + `keepalive: true` |
| Click link / SPA navigation | `useEffect` cleanup (component unmount) |

The `hasSentLeave` ref prevents both handlers from firing in the same navigation event.

---

## Verification

1. Join a race, then close the tab — participant disappears from the leaderboard within 2s (next SSE poll)
2. Join a race, manually change the URL — same as above
3. Join a race, click the home link — same as above
4. Complete the race, then close the tab — participant is still deleted (desired per requirements)
5. Attempt `DELETE` on a non-active race — server returns `404`
