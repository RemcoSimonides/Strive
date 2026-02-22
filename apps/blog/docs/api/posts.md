---
sidebar_position: 5
title: Posts
displayed_sidebar: apiSidebar
---

# Posts

Create, retrieve, and delete posts for a specific goal. Posts represent progress updates, notes, or story entries on the path to achieving a goal.

## List Posts

Returns posts for a goal, ordered by date (newest first).

**Required scope:** `posts:read`

```
GET /api/v1/goals/:goalId/posts
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |
| `limit` | query | Number of posts to return (default 50, max 100) |

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123/posts?limit=10
```

### Response

```json
{
  "data": [
    {
      "id": "post001",
      "description": "Completed my first 5K run today!",
      "goalId": "abc123",
      "uid": "user123",
      "url": "",
      "date": "2026-02-20T14:00:00.000Z",
      "createdAt": "2026-02-20T14:00:00.000Z",
      "updatedAt": "2026-02-20T14:00:00.000Z"
    }
  ]
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `You are not a stakeholder of this goal` | You don't have access to this goal |

---

## Get Post

Returns a single post by ID.

**Required scope:** `posts:read`

```
GET /api/v1/goals/:goalId/posts/:postId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |
| `postId` | path | The ID of the post |

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123/posts/post001
```

### Response

```json
{
  "data": {
    "id": "post001",
    "description": "Completed my first 5K run today!",
    "goalId": "abc123",
    "uid": "user123",
    "url": "",
    "date": "2026-02-20T14:00:00.000Z",
    "createdAt": "2026-02-20T14:00:00.000Z",
    "updatedAt": "2026-02-20T14:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `You are not a stakeholder of this goal` | You don't have access to this goal |
| 404 | `Post not found` | No post exists with this ID |

---

## Create Post

Creates a new post for a goal. You must be an admin or achiever of the goal.

Creating a post automatically triggers events: a goal story item is created and a goal event is logged.

**Required scope:** `posts:write`

```
POST /api/v1/goals/:goalId/posts
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | Yes | The post content |
| `date` | string | No | ISO 8601 date. Defaults to current time |
| `url` | string | No | An optional URL to attach |
| `milestoneId` | string | No | Link this post to a milestone |

### Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"description": "Ran 10km today!", "milestoneId": "ms001"}' \
  https://api.strivejournal.com/api/v1/goals/abc123/posts
```

### Response (201 Created)

```json
{
  "data": {
    "id": "post002",
    "description": "Ran 10km today!",
    "goalId": "abc123",
    "uid": "user123",
    "milestoneId": "ms001",
    "url": "",
    "date": "2026-02-22T10:00:00.000Z",
    "createdAt": "2026-02-22T10:00:00.000Z",
    "updatedAt": "2026-02-22T10:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `description is required and must be a string` | Missing or invalid description |
| 403 | `Only admins and achievers can create posts` | Insufficient role |
| 404 | `Goal not found` | No goal exists with this ID |

---

## Delete Post

Deletes a post. Only the post owner or a goal admin can delete posts.

Deleting a post automatically triggers cleanup: associated media and story items are removed.

**Required scope:** `posts:write`

```
DELETE /api/v1/goals/:goalId/posts/:postId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `goalId` | path | The ID of the goal |
| `postId` | path | The ID of the post |

### Example Request

```bash
curl -X DELETE \
  -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/goals/abc123/posts/post001
```

### Response

```json
{
  "data": {
    "id": "post001",
    "deleted": true
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `Only post owner or goal admin can delete posts` | Insufficient permissions |
| 404 | `Post not found` | No post exists with this ID |
