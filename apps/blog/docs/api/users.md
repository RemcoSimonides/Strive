---
sidebar_position: 5
title: Users
displayed_sidebar: apiSidebar
---

# Users

Retrieve your user profile.

**Required scope:** `user:read`

## Get Current User

Returns the profile of the authenticated user (the owner of the API key).

```
GET /api/v1/users/me
```

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/users/me
```

### Response

```json
{
  "data": {
    "uid": "user123",
    "username": "remco",
    "photoURL": "https://storage.googleapis.com/...",
    "numberOfSpectating": 5,
    "createdAt": "2025-06-01T12:00:00.000Z",
    "updatedAt": "2026-02-20T14:00:00.000Z"
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 404 | `User not found` | No user profile exists for this API key owner |
