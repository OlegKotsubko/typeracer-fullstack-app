# Participant Leave & Admin Logout

## Feature 1: Remove Participant on Page Leave

### Goal
When a user navigates away from a race page, their participant record is deleted from the database so other participants no longer see them in the race.

### Behavior
- Only triggers if the user has joined the race (has a `participantId`)
- Fires on `beforeunload` event (tab close, navigation away, refresh)
- Uses `navigator.sendBeacon` to reliably deliver the delete request during page unload
- Participant record is fully deleted from the `participants` table

### API Changes
Add a `DELETE` handler to `src/app/api/races/[id]/participants/[participantId]/route.ts`:
- Deletes the participant row from the database
- Returns 200 on success, 404 if participant not found
- No auth required (participants are anonymous)

### Client Changes
In `src/components/race/race-interface.tsx`:
- Add a `useEffect` that registers a `beforeunload` listener when `participantId` is set
- The handler calls `navigator.sendBeacon` to `DELETE /api/races/{raceId}/participants/{participantId}`
- Cleanup removes the listener on unmount
- Note: `sendBeacon` only supports POST, so we use a POST to a `/leave` endpoint or use `fetch` with `keepalive: true` for the DELETE method

### Revised approach for sendBeacon limitation
Since `navigator.sendBeacon` only sends POST requests and we need DELETE semantics:
- Use `fetch` with `keepalive: true` in the `beforeunload` handler to send a DELETE request
- This is supported in modern browsers and allows the request to outlive the page

## Feature 2: Admin Logout Button

### Goal
Add a logout button in the admin sidebar next to the "Admin Panel" text.

### Changes
- Extract a `<AdminSidebar />` client component from the admin layout (`src/app/admin/layout.tsx`)
- The sidebar component imports `signOut` from `@/lib/auth-client`
- Logout button placed next to the "Admin Panel" subtitle
- On click: calls `signOut()`, then redirects to `/admin/login`
- The admin layout remains a server component, rendering `<AdminSidebar />` as a client island

### UI
- Small, subtle button (e.g., text-style or ghost variant) labeled "Log out"
- Positioned inline with the "Admin Panel" text
