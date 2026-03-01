---
sidebar_position: 7
title: Integrations
displayed_sidebar: apiSidebar
---

# Building Integrations

This guide explains how to build integrations that log activities into Strive goals using the REST API. The built-in Strava integration serves as a reference implementation.

## Overview

An integration connects an external service (like Strava, Garmin, or a custom app) to Strive so that activities are automatically logged as posts on a goal. The flow is:

1. **Create an API key** with the `posts:write` scope
2. **Listen for events** from the external service (e.g., via webhooks)
3. **Call `POST /api/v1/goals/:goalId/posts`** to log each activity

## Step 1: Create an API Key

Each integration needs its own API key scoped to the minimum required permissions. For posting activities, you need the `posts:write` scope.

Create a key using the [Create API Key](/api/api-keys#create-api-key) endpoint or programmatically:

```bash
curl -X POST \
  -H "Authorization: Bearer sk_live_your_admin_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Integration", "scopes": ["posts:write"]}' \
  https://api.strivejournal.com/api/v1/keys
```

Store the returned key securely. It is only shown once.

## Step 2: Create Posts

When your external service reports a new activity, create a post:

```bash
curl -X POST \
  -H "Authorization: Bearer sk_live_integration_key" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Morning run - 5km",
    "date": "2026-02-28T08:00:00.000Z",
    "url": "https://external-service.com/activity/123"
  }' \
  https://api.strivejournal.com/api/v1/goals/abc123/posts
```

### Response Codes

| Status | Meaning |
|--------|---------|
| 201 | Post created successfully |
| 401 | API key is invalid or revoked |
| 403 | Insufficient permissions or not a stakeholder |

## Example: Strava Integration

The built-in Strava integration (`apps/functions/src/https/strava.ts`) demonstrates this pattern:

1. **On connect:** Creates an API key with `posts:write` scope, encrypts and stores it in the user's secure profile
2. **On webhook:** Decrypts the stored API key, creates a `StriveApiClient`, and calls `createPost()` to log the activity
3. **On disconnect:** The API key is automatically revoked via a Firestore trigger

This same pattern can be applied to any external service that supports webhooks or polling.

## Security Best Practices

- **Scope minimally:** Only request `posts:write` unless you need other permissions
- **Encrypt stored keys:** If storing API keys in a database, encrypt them at rest
- **Revoke on disconnect:** When a user disables an integration, revoke the associated API key
- **Handle 401 gracefully:** If the API returns 401, the key has been revoked — disable the integration and notify the user
