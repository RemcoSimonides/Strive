---
sidebar_position: 3
title: Goals
displayed_sidebar: apiSidebar
---

# Goals

Manage goals where you are a stakeholder (admin, achiever, supporter, or spectator).

**Read scope:** `goals:read` | **Write scope:** `goals:write`

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

---

## Create Goal

Creates a new goal. You will be set as the admin, achiever, and spectator.

Creating a goal automatically triggers events: goal event logging, AI categorization, and Algolia indexing.

**Required scope:** `goals:write`

```
POST /api/v1/goals
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | The goal title |
| `description` | string | No | Goal description |
| `deadline` | string | No | ISO 8601 date. Defaults to end of current/next year |
| `publicity` | string | No | `"public"` or `"private"` (default `"private"`) |
| `image` | string | No | URL to a goal image |

### Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"title": "Run a marathon", "description": "Complete a full marathon", "publicity": "public"}' \
  https://api.strivejournal.com/api/v1/goals
```

### Response (201 Created)

```json
{
  "data": {
    "id": "abc123",
    "title": "Run a marathon",
    "description": "Complete a full marathon",
    "status": "pending",
    "publicity": "public",
    "deadline": "2026-12-31T23:59:59.999Z",
    "numberOfAchievers": 0,
    "numberOfSupporters": 0,
    "tasksCompleted": 0,
    "tasksTotal": 1,
    "createdAt": "2026-02-22T10:00:00.000Z",
    "updatedAt": "2026-02-22T10:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `title is required and must be a string` | Missing or invalid title |

---

## Update Goal

Updates a goal. You must be an admin of the goal.

Updating a goal automatically triggers side effects: Algolia re-indexing, event logging, and support updates.

**Required scope:** `goals:write`

```
PATCH /api/v1/goals/:goalId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |

### Request Body

All fields are optional. Only provided fields are updated.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | The goal title |
| `description` | string | Goal description |
| `deadline` | string | ISO 8601 date |
| `status` | string | `"pending"`, `"succeeded"`, or `"failed"` |
| `publicity` | string | `"public"` or `"private"` |

:::info
Computed fields like `numberOfAchievers`, `tasksCompleted`, and `tasksTotal` cannot be set directly. They are managed automatically by Firestore triggers.
:::

### Example Request

```bash
curl -X PATCH \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"status": "succeeded"}' \
  https://api.strivejournal.com/api/v1/goals/abc123
```

### Response

```json
{
  "data": {
    "id": "abc123",
    "title": "Run a marathon",
    "status": "succeeded",
    "...": "..."
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `No valid fields to update` | No recognized fields in request body |
| 400 | `status must be one of: pending, succeeded, failed` | Invalid status value |
| 403 | `Only admins can update goals` | You are not an admin of this goal |
| 404 | `Goal not found` | No goal exists with this ID |
