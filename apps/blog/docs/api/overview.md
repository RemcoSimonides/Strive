---
sidebar_position: 1
title: Overview
displayed_sidebar: apiSidebar
---

# API Documentation

The Strive API lets you programmatically access your goals, milestones, and profile data. Use it to build integrations, automate workflows, or connect Strive with other tools.

## Base URL

```
https://api.strivejournal.com
```

All API endpoints are prefixed with `/api/v1`.

## Authentication

Every request must include a valid API key in the `Authorization` header:

```
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

API keys can be created in the Strive app under **Settings > API Keys**, or via the [API Keys endpoints](/api/api-keys).

### API Key Format

Keys use the prefix `sk_live_` followed by 64 hexadecimal characters. The full key is only shown once at creation time — store it securely.

### Scopes

Each API key has a set of scopes that determine which endpoints it can access:

| Scope | Description |
|-------|-------------|
| `goals:read` | Read goals |
| `goals:write` | Create and update goals |
| `milestones:read` | Read milestones |
| `milestones:write` | Create and update milestones |
| `user:read` | Read your profile |
| `posts:read` | Read posts |
| `posts:write` | Create and delete posts |
| `supports:read` | Read supports |

If a request requires a scope that the API key doesn't have, the server returns a **403 Forbidden** response.

## Rate Limiting

The API allows **60 requests per minute** per API key.

Rate limit information is included in every response:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window (60) |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

When the limit is exceeded, the API returns **429 Too Many Requests** with a `Retry-After` header indicating how many seconds to wait.

## Response Format

All successful responses return JSON with a `data` field:

```json
{
  "data": { ... }
}
```

Error responses include an `error` field:

```json
{
  "error": "Description of what went wrong"
}
```

## Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (invalid parameters) |
| 401 | Not authenticated (missing or invalid API key) |
| 403 | Forbidden (insufficient scopes or access denied) |
| 404 | Resource not found |
| 429 | Rate limit exceeded |

## Health Check

You can verify the API is operational with a simple GET request:

```bash
curl https://api.strivejournal.com/status
```

```json
{
  "status": "ok",
  "timestamp": "2026-02-22T12:00:00.000Z"
}
```

This endpoint does not require authentication.
