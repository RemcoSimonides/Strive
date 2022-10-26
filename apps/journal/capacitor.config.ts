import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.strive.journal',
  appName: 'Strive Journal',
  webDir: '../../dist/apps/journal/browser',
  bundledWebRuntime: false,
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '423468347975-tjkdd38gna8rfgqd16f0jpf1o5bl6204.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
