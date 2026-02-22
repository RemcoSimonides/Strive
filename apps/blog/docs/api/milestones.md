---
sidebar_position: 4
title: Milestones
displayed_sidebar: apiSidebar
---

# Milestones

Manage milestones for a specific goal. Milestones represent key steps or checkpoints on the path to achieving a goal.

**Read scope:** `milestones:read` | **Write scope:** `milestones:write`

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

---

## Create Milestone

Creates a new milestone for a goal. You must be an admin or achiever of the goal.

Creating a milestone automatically triggers: `tasksTotal` counter increment, goal event logging, and deadline scheduling.

**Required scope:** `milestones:write`

```
POST /api/v1/goals/:goalId/milestones
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | The milestone title/content |
| `description` | string | No | Detailed description |
| `deadline` | string | No | ISO 8601 date for the milestone deadline |
| `order` | number | No | Position in the milestone list (default 0) |
| `subtasks` | array | No | Array of subtask objects |

### Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"content": "Complete first 5K run", "deadline": "2026-03-31T00:00:00.000Z"}' \
  https://api.strivejournal.com/api/v1/goals/abc123/milestones
```

### Response (201 Created)

```json
{
  "data": {
    "id": "ms003",
    "content": "Complete first 5K run",
    "description": "",
    "status": "pending",
    "order": 0,
    "deadline": "2026-03-31T23:59:59.999Z",
    "subtasks": [],
    "createdAt": "2026-02-22T10:00:00.000Z",
    "updatedAt": "2026-02-22T10:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `content is required and must be a string` | Missing or invalid content |
| 403 | `Only admins and achievers can create milestones` | Insufficient role |
| 404 | `Goal not found` | No goal exists with this ID |

---

## Update Milestone

Updates a milestone. You must be an admin or achiever of the goal.

Updating a milestone triggers side effects: status changes update `tasksCompleted` counter, create events, and update supports.

**Required scope:** `milestones:write`

```
PATCH /api/v1/goals/:goalId/milestones/:milestoneId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |
| `milestoneId` | path | The ID of the milestone |

### Request Body

All fields are optional. Only provided fields are updated.

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | The milestone title/content |
| `description` | string | Detailed description |
| `deadline` | string | ISO 8601 date |
| `status` | string | `"pending"`, `"succeeded"`, or `"failed"` |
| `order` | number | Position in the milestone list |
| `subtasks` | array | Array of subtask objects |

### Example Request

```bash
curl -X PATCH \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"status": "succeeded"}' \
  https://api.strivejournal.com/api/v1/goals/abc123/milestones/ms001
```

### Response

```json
{
  "data": {
    "id": "ms001",
    "content": "Complete first 5K run",
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
| 403 | `Only admins and achievers can update milestones` | Insufficient role |
| 404 | `Milestone not found` | No milestone exists with this ID |

---

## Delete Milestone

Soft-deletes a milestone. You must be an admin of the goal.

The milestone is not permanently removed — it is marked with a `deletedAt` timestamp and excluded from list queries. This triggers counter decrements and support cleanup.

**Required scope:** `milestones:write`

```
DELETE /api/v1/goals/:goalId/milestones/:milestoneId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |
| `milestoneId` | path | The ID of the milestone |

### Example Request

```bash
curl -X DELETE \
  -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123/milestones/ms001
```

### Response

```json
{
  "data": {
    "id": "ms001",
    "deleted": true
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `Only admins can delete milestones` | You must be an admin of the goal |
| 404 | `Milestone not found` | No milestone exists with this ID |
