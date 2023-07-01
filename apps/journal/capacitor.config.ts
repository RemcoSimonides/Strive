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
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['apple.com', 'google.com']
    },
    SplashScreen: {
      launchAutoHide: false
    }
  },
  server: {
    androidScheme: "http" // https://capacitorjs.com/docs/updating/5-0#update-androidscheme
  }
}

export default config
