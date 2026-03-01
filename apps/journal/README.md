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

### Web

Just push to the `master` branch. CI/CD handles the rest.

### Android

#### Via CI (recommended)

Push a tag or trigger manually:

```bash
# Internal testing track
git tag android-v1.16.3 && git push origin android-v1.16.3

# Or trigger manually via GitHub Actions → Deploy Android → Run workflow
```

#### Locally with Fastlane

1. Update the version in `android/app/build.gradle`
2. Build and sync:
   ```bash
   npx nx build journal --configuration=production
   npx nx run journal:sync:android
   ```
3. Run Fastlane:
   ```bash
   cd apps/journal/android
   bundle install
   bundle exec fastlane build          # Build signed AAB only
   bundle exec fastlane deploy_internal # Build + upload to internal track
   ```
   Required env vars: `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` (and a `keystore.jks` in the android dir).

> **Important:** Do not commit `package-lock.json` in `apps/journal` as it will break CI/CD for the web deployment.

### iOS

#### Via CI (recommended)

Push a tag or trigger manually:

```bash
# TestFlight
git tag ios-v1.16.3 && git push origin ios-v1.16.3

# Or trigger manually via GitHub Actions → Deploy iOS → Run workflow
```

#### Locally with Fastlane

1. Build and sync:
   ```bash
   npm install
   npx nx build journal --configuration=production
   npx nx run journal:sync:ios
   ```
2. Run Fastlane:
   ```bash
   cd apps/journal/ios/App
   bundle install
   bundle exec fastlane build             # Build signed IPA only
   bundle exec fastlane deploy_testflight  # Build + upload to TestFlight
   ```
   Required env vars: `MATCH_GIT_URL`, `MATCH_PASSWORD`, `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY_CONTENT`.
