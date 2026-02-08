# Cloud Functions

Firebase Cloud Functions for the Strive backend.

## Running locally

Build the functions and start the Firebase emulator:

```bash
npx nx build functions && firebase emulators:start --only functions
```

The emulator runs on port **5001**. The URL pattern is:

```
http://localhost:5001/<project-id>/us-central1/<function-name>
http://localhost:5001/strive-journal/us-central1/api/status
```

The project ID depends on which Firebase project is active (`firebase use`):

| Project | ID |
| --- | --- |
| Production | `strive-journal` |
| Development | `strive-journal-remco` |

## API endpoints

The `api` function is an Express app that hosts REST endpoints.

### GET /status

Returns the health status of the backend.

```bash
curl http://localhost:5001/strive-journal/us-central1/api/status
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-02-08T12:00:00.000Z"
}
```

## Deploying

```bash
npx nx deploy-functions functions
```
