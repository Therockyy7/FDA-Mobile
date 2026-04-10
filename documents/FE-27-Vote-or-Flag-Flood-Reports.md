# FE-27 - Vote Flood Reports (Upvote/Downvote)

> Feature: Community Self-Regulation via Voting  
> Updated: 2026-03-15  
> Status: Re-defined (Lean model)

---

## 1) Goal

Replace vote+flag complexity with a single simple voting model:
- Upvote (+1)
- Downvote (-1)

Community voting directly controls report visibility without moderator intervention.

---

## 2) Endpoint

- Method: `POST /api/v1/flood-reports/{id}/vote`
- Auth: required (user account)

Optional companion endpoint:
- `DELETE /api/v1/flood-reports/{id}/vote` (remove user vote)

---

## 3) Business Rules

### 3.1 Vote types

- `VoteType = 1` => upvote
- `VoteType = -1` => downvote

### 3.2 One vote per user per report

- Unique constraint: `(ReportId, UserId)`
- If user votes again:
  - update existing vote (replace old value)

### 3.3 Score recalculation

Score model:
- Report starts with `Score = 1` at creation time (FE-25)
- After each vote update:
  - recompute score from base + vote deltas
  - or maintain atomic incremental update with care for vote replacement

### 3.4 Auto-hide

After score update:
- If `Score <= -10` => set `Status = Hidden`
- Else keep `Status = Published`

---

## 4) Request/Response (Minimum)

Request:
```json
{
  "voteType": 1
}
```

Response:
```json
{
  "reportId": "...",
  "score": 4,
  "status": "Published",
  "votes": {
    "up": 8,
    "down": 5,
    "currentUserVote": 1
  }
}
```

---

## 5) Data Model

Table: `flood_report_votes`
- `ReportId`
- `UserId`
- `VoteType` (1 or -1)
- `CreatedAt`

Constraints:
- Unique `(ReportId, UserId)`
- Check `VoteType IN (1, -1)`

---

## 6) Pseudocode

```csharp
var existingVote = FindVote(reportId, userId);

if (existingVote == null)
    InsertVote(reportId, userId, voteType);
else
    UpdateVote(existingVote, voteType);

var score = RecalculateScore(reportId);
var status = score <= -10 ? Hidden : Published;

UpdateReportScoreAndStatus(reportId, score, status);
return Ok(score, status, voteSummary);
```

---

## 7) De-scoped from previous FE-27

Removed in this new FE-27:
- `Flag` endpoint
- Spam/Fake/Inappropriate reason flow
- Moderator escalation triggers based on flags

Community downvote + auto-hide is the only moderation mechanism for this phase.