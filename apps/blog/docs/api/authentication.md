---
sidebar_position: 2
title: Authentication
displayed_sidebar: apiSidebar
---

# Authentication

The Strive API uses API keys for authentication. Every request to a protected endpoint must include a valid API key.

## Creating an API Key

You can create API keys in two ways:

1. **In the Strive app** — Go to **Settings > API Keys** and create a new key
2. **Via the API** — Use the [Create API Key](/api/api-keys#create-api-key) endpoint (requires an existing key)

When creating a key, you specify:
- **Name** — A label to identify the key (e.g., "My Integration")
- **Scopes** — The permissions this key should have (e.g., `goals:read`, `goals:write`, `posts:write`, `milestones:write`)
- **Expiration** (optional) — When the key should automatically expire

:::caution
The full API key is only shown **once** at creation time. Store it securely — it cannot be retrieved later.
:::

## Using Your API Key

Include the key in the `Authorization` header of every request:

```bash
curl -H "Authorization: Bearer sk_live_your_key_here" \
  https://api.strivejournal.com/api/v1/users/me
```

## Key Limits

- Each user can have a maximum of **10 active API keys**
- Keys created via the API cannot have more scopes than the key used to create them

## Revoking a Key

If a key is compromised, revoke it immediately using the [Revoke API Key](/api/api-keys#revoke-api-key) endpoint or from the Strive app settings. Revoked keys are permanently disabled and cannot be reactivated.

## Error Responses

| Status | Error | Meaning |
|--------|-------|---------|
| 401 | `Not authenticated` | Missing or invalid API key |
| 401 | `API key has expired` | Key has passed its expiration date |
| 403 | `Forbidden` | Key doesn't have the required scope |
