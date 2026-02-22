---
sidebar_position: 6
title: API Keys
displayed_sidebar: apiSidebar
---

# API Keys

Manage API keys programmatically. These endpoints let you create, list, and revoke API keys.

**Authentication required** — no specific scope needed.

## Create API Key

Creates a new API key. The new key cannot have scopes that the requesting key doesn't have.

```
POST /api/v1/api-keys
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | A label to identify the key |
| `scopes` | string[] | Yes | Permission scopes for the key |
| `expiresAt` | string | No | ISO 8601 expiration date |

**Available scopes:** `goals:read`, `goals:write`, `milestones:read`, `milestones:write`, `user:read`, `posts:read`, `supports:read`

### Example Request

```bash
curl -X POST \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CI Integration",
    "scopes": ["goals:read", "milestones:read"],
    "expiresAt": "2027-01-01T00:00:00.000Z"
  }' \
  https://api.strivejournal.com/api/v1/api-keys
```

### Response (201 Created)

```json
{
  "data": {
    "id": "key123",
    "name": "CI Integration",
    "prefix": "sk_live_a1b2c3d4",
    "scopes": ["goals:read", "milestones:read"],
    "expiresAt": "2027-01-01T00:00:00.000Z",
    "createdAt": "2026-02-22T12:00:00.000Z"
  },
  "key": "sk_live_a1b2c3d4e5f6..."
}
```

:::caution
The `key` field is only returned in this response. Store it securely — it cannot be retrieved again.
:::

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | `Name is required` | Missing name field |
| 400 | `Scopes must be a non-empty array` | Missing or empty scopes |
| 400 | `Maximum of 10 active API keys allowed` | Key limit reached |
| 403 | `Cannot grant scopes you don't have: ...` | Trying to escalate permissions |

---

## List API Keys

Returns all active (non-revoked) API keys for the authenticated user.

```
GET /api/v1/api-keys
```

### Example Request

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/api-keys
```

### Response

```json
{
  "data": [
    {
      "id": "key123",
      "name": "CI Integration",
      "prefix": "sk_live_a1b2c3d4",
      "scopes": ["goals:read", "milestones:read"],
      "lastUsedAt": "2026-02-22T10:00:00.000Z",
      "expiresAt": "2027-01-01T00:00:00.000Z",
      "createdAt": "2026-02-20T12:00:00.000Z"
    }
  ]
}
```

:::note
The full API key is never returned after creation. The `prefix` field (first 16 characters) can be used to identify keys.
:::

---

## Revoke API Key

Permanently revokes an API key. Revoked keys cannot be reactivated.

```
DELETE /api/v1/api-keys/:keyId
```

### Parameters

| Parameter | In | Description |
|-----------|------|-------------|
| `keyId` | path | The ID of the API key to revoke |

### Example Request

```bash
curl -X DELETE \
  -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/api-keys/key123
```

### Response

```json
{
  "data": {
    "id": "key123",
    "revoked": true
  }
}
```

### Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 403 | `You can only revoke your own API keys` | Key belongs to another user |
| 404 | `API key not found` | No key exists with this ID |
| 400 | `API key is already revoked` | Key was already revoked |
