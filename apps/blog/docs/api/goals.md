---
sidebar_position: 3
title: Goals
displayed_sidebar: apiSidebar
---

# Goals

Retrieve goals where you are a stakeholder (admin, achiever, supporter, or spectator).

**Required scope:** `goals:read`

## List Goals

Returns all goals where you are a stakeholder.

```
GET /api/v1/goals
```

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals
```

### Response

```json
{
  "data": [
    {
      "id": "abc123",
      "title": "Run a marathon",
      "description": "Complete a full marathon by end of year",
      "isPublic": true,
      "status": "pending",
      "deadline": "2026-12-31T00:00:00.000Z",
      "numberOfAchievers": 1,
      "numberOfSupporters": 3,
      "image": "https://storage.googleapis.com/...",
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-02-20T14:00:00.000Z"
    }
  ]
}
```

---

## Get Goal

Returns a single goal by ID. You must be a stakeholder of the goal.

```
GET /api/v1/goals/:goalId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123
```

### Response

```json
{
  "data": {
    "id": "abc123",
    "title": "Run a marathon",
    "description": "Complete a full marathon by end of year",
    "isPublic": true,
    "status": "pending",
    "deadline": "2026-12-31T00:00:00.000Z",
    "numberOfAchievers": 1,
    "numberOfSupporters": 3,
    "image": "https://storage.googleapis.com/...",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-02-20T14:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `You are not a stakeholder of this goal` | You don't have access to this goal |
| 404 | `Goal not found` | No goal exists with this ID |
