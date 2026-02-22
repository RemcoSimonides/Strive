---
sidebar_position: 4
title: Milestones
displayed_sidebar: apiSidebar
---

# Milestones

Retrieve milestones for a specific goal. Milestones represent key steps or checkpoints on the path to achieving a goal.

**Required scope:** `milestones:read`

## List Milestones

Returns all active milestones for a goal, ordered by their position.

```
GET /api/v1/goals/:goalId/milestones
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123/milestones
```

### Response

```json
{
  "data": [
    {
      "id": "ms001",
      "description": "Complete first 5K run",
      "status": "succeeded",
      "order": 0,
      "deadline": "2026-03-31T00:00:00.000Z",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-02-10T08:00:00.000Z"
    },
    {
      "id": "ms002",
      "description": "Run a half marathon",
      "status": "pending",
      "order": 1,
      "deadline": "2026-06-30T00:00:00.000Z",
      "createdAt": "2026-01-15T10:35:00.000Z",
      "updatedAt": "2026-01-15T10:35:00.000Z"
    }
  ]
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `You are not a stakeholder of this goal` | You don't have access to this goal |

---

## Get Milestone

Returns a single milestone by ID.

```
GET /api/v1/goals/:goalId/milestones/:milestoneId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |
| `milestoneId` | path | The ID of the milestone |

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123/milestones/ms001
```

### Response

```json
{
  "data": {
    "id": "ms001",
    "description": "Complete first 5K run",
    "status": "succeeded",
    "order": 0,
    "deadline": "2026-03-31T00:00:00.000Z",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-02-10T08:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `You are not a stakeholder of this goal` | You don't have access to this goal |
| 404 | `Milestone not found` | No milestone exists with this ID |
