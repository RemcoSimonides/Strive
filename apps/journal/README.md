# Journal

Main user-facing app for Strive Journal. Built with Angular + Ionic as a PWA with SSR, and native mobile support via Capacitor.

## Testing

### Unit tests

```bash
npx nx test journal
```

### E2E tests

```bash
npx nx e2e journal-e2e
```

This starts the dev server automatically and runs Cypress against `http://localhost:4200`.

To run Cypress interactively:

```bash
npx nx e2e journal-e2e --watch
```

## Deploying

Estimated time: ~30 minutes

### Web

Just push to the `master` branch. CI/CD handles the rest.

### Android

1. Update the version in `apps/journal/android/app/build.gradle`
2. Build and sync:
   ```bash
   npx nx build journal
   npx nx run journal:sync:android
   ```
3. Fix `node_module` paths in `apps/journal/android/capacitor.settings.gradle` (add `../../`)
4. Install dependencies and open Android Studio:
   ```bash
   cd apps/journal
   npm i
   npx nx run journal:open:android
   ```
   - Make sure `node_modules` exist in `apps/journal`
   - Make sure to use Gradle 21 in Gradle settings
5. Build and publish via the [Play Store Console](https://play.google.com/console/u/0/developers/7966145120224072678/app/4972450714278503906/app-dashboard)

> **Important:** Do not commit `package-lock.json` in `apps/journal` as it will break CI/CD for the web deployment.

### iOS

1. Fetch latest and build:
   ```bash
   npm install
   npx nx build journal
   npx nx run journal:sync:ios --preserveProjectNodeModules
   ```
2. Check if `apps/journal` still contains `node_modules`, otherwise run `npm i` in that folder
3. Open Xcode:
   ```bash
   npx nx run journal:open:ios
   ```
4. Update the version in Xcode under **Target > General**
5. Test on a device/simulator
6. Archive and upload to App Store Connect / TestFlight

> **Note:** There have been issues where `node_modules` had to be moved into `apps/journal` manually. The emulator may not start the app, but pushing to TestFlight works fine.
