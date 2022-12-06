import { CapacitorConfig } from '@capacitor/cli'
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard'

const config: CapacitorConfig = {
  appId: 'com.strive.journal',
  appName: 'Strive Journal',
  webDir: '../../dist/apps/journal/browser',
  bundledWebRuntime: false,
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Ionic,
      style: KeyboardStyle.Dark
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '423468347975-tjkdd38gna8rfgqd16f0jpf1o5bl6204.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['apple.com']
    },
    SplashScreen: {
      launchAutoHide: false
    }
  }
};

export default config;
