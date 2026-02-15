# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Strive is a goal-tracking and personal development platform built as an Nx monorepo. It combines an Ionic Angular PWA (with SSR and Capacitor for native mobile) with Firebase backend services.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Build the main journal app
npm run build                    # or: npx nx build journal

# Build other apps
npm run build:admin              # nx build admin
npx nx build functions           # Firebase Cloud Functions

# Serve (dev)
npx nx serve journal             # Dev server at localhost:4200
npx nx serve admin

# SSR
npm run serve:ssr                # node dist/apps/journal/server/main.js

# Lint
npx nx lint journal
npx nx lint functions
npx nx lint <project-name>

# Test (Jest)
npx nx test journal              # Run all tests for journal
npx nx test <lib-name>           # e.g., npx nx test goal
npx nx test journal --testFile=path/to/spec  # Single test file

# Deploy
npm run deploy:hosting:journal   # Build + deploy journal to Firebase Hosting
npx nx deploy-functions functions  # Deploy Cloud Functions
firebase deploy --only firestore   # Deploy Firestore rules
firebase deploy --only functions   # Deploy functions directly

# Firebase emulators
firebase emulators:start
```

## Architecture

### Apps (`apps/`)

| App                             | Description                                       | Framework              |
| ------------------------------- | ------------------------------------------------- | ---------------------- |
| **journal**                     | Main user-facing app (PWA + native via Capacitor) | Angular 20 + Ionic 8   |
| **admin**                       | Admin panel                                       | Angular (browser-only) |
| **functions**                   | Firebase Cloud Functions (serverless backend)     | Node.js 22, esbuild    |
| **blog**                        | Documentation/blog site                           | Docusaurus             |
| **journal-e2e** / **admin-e2e** | E2E tests                                         | Cypress                |

### Libraries (`libs/`)

All libraries use the `@strive/<lib>` import path (configured in `tsconfig.base.json`). Import patterns:

- `@strive/model` — data interfaces and factory functions (barrel export)
- `@strive/<lib>/*` — direct file imports within each lib (e.g., `@strive/goal/goal.service`)

**Core domain libs:**

- **model** — TypeScript interfaces and factory functions (`createGoal()`, `createUser()`, etc.) for all Firestore documents. No Angular dependencies.
- **goal** — Goal CRUD, goal service, upsert modals, components
- **stakeholder** — GoalStakeholder roles (admin, achiever, supporter, spectator), reminders
- **roadmap** — Milestones and roadmap visualization
- **exercises** — Five exercise modules: affirmations, daily-gratitude, dear-future-self, self-reflect, wheel-of-life
- **support** — Bilateral support/accountability system

**Social/interaction libs:**

- **post** — Story posts with media
- **chat** — ChatGPT integration + comment system (OpenAI)
- **spectator** — User following system
- **story** — Story feed aggregation
- **notification** — Push/email notification handling

**Infrastructure libs:**

- **auth** — Firebase Auth + Capacitor Firebase Auth plugin, user state via signals
- **user** — Profile and personal settings (FCM tokens)
- **media** — Firebase Storage upload/download
- **utils** — Firebase utilities (`toDate()`, `joinWith()`, `createConverter()`), Algolia, PWA, SEO, theme services
- **ui** — Shared UI components (headers, footer, description editor, etc.)
- **api** — API abstraction layer
- **strava** — Strava integration

### Firestore Data Model

Top-level collections and their subcollections:

```
Goals/{goalId}
  ├── GStakeholders/{uid}
  │   └── Reminders/{id}
  ├── Milestones/{milestoneId}
  ├── Posts/{postId}
  ├── Comments/{commentId}
  ├── ChatGPT/{messageId}
  ├── Supports/{supportId}
  ├── InviteTokens/{tokenId}
  ├── Media/{mediaId}
  └── Story/{itemId}

Users/{uid}
  ├── Personal/{userId}
  ├── Notifications/{notificationId}
  ├── Spectators/{spectatorId}
  └── Exercises/{exerciseId}
      └── Entries/{entryId}

GoalEvents/{eventId}
Strava/{stravaId}
```

### Cloud Functions (`apps/functions/src/`)

**Adding a new npm dependency to functions:** The build uses `bundle: true` with esbuild, so workspace code is inlined. Runtime npm dependencies must be added to **both** `apps/functions/project.json` (`external` array) **and** `apps/functions/package.json` (`dependencies`). Missing from `external` = esbuild bundles it (may break native modules). Missing from `package.json` = Cloud Build won't install it (runtime crash).

Three categories of functions exported from `main.ts`:

- **Firestore triggers** (`firestore/`) — React to document create/update/delete on Goals, Users, and their subcollections
- **PubSub/scheduled** (`pubsub/`) — Cron jobs for emails, reminders, exercise tasks
- **HTTP callable** (`https/`) — Scraping, Strava webhooks, collective goal creation

### Key Patterns

- **Factory functions**: Every model has a `create*()` function (e.g., `createGoal()`) that returns a default instance with optional partial overrides
- **Firestore converters**: Services define `toFirestore`/`fromFirestore` converters that handle Timestamp-to-Date conversion via `toDate()` and add audit fields (`createdAt`, `updatedAt`, `updatedBy`)
- **`joinWith()` operator**: Custom RxJS operator in `libs/utils` for joining Firestore documents (similar to SQL JOIN), used extensively in services
- **Standalone components**: Angular standalone components with lazy-loaded routes
- **Signals + RxJS**: The codebase uses Angular signals alongside RxJS observables for state management
- **Multi-platform**: Capacitor plugins handle native features (camera, push notifications, filesystem) with web fallbacks

### Environment Configuration

- `environments/environment.ts` — active environment pointer
- `environments/environment.prod.ts` — production Firebase config
- `environments/environment.remco.ts` — development Firebase config
- Imported as `@env` throughout the codebase

### Firebase Projects

- **prod**: `strive-journal`
- **remco** (dev): `strive-journal-remco`

## Tech Stack

Angular 20, Ionic 8, Capacitor 7, Nx 21, Firebase (Firestore, Functions, Auth, Storage, Hosting), RxJS, Jest, Cypress, SCSS, esbuild, Sentry, Algolia, OpenAI, SendGrid, Chart.js, date-fns

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.

<!-- nx configuration end-->
