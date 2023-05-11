import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { ToastController, ToastOptions } from '@ionic/angular'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'
import { FCM } from '@capacitor-community/fcm'

import { arrayRemove, arrayUnion, DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { getToken, getMessaging, onMessage, Unsubscribe, isSupported } from 'firebase/messaging'
import { FireSubCollection } from 'ngfire'
import { getAuth } from 'firebase/auth'

import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications'
import * as Sentry from '@sentry/capacitor'

import { user } from 'rxfire/auth'
import { Observable, of, switchMap, shareReplay, BehaviorSubject, startWith } from 'rxjs'

import { Personal } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'
import { PushNotificationSettingsForm, SettingsForm } from './forms/settings.form'


@Injectable({ providedIn: 'root' })
export class PersonalService extends FireSubCollection<Personal> {
  readonly path = 'Users/:uid/Personal'
  override readonly idKey = 'uid'
  override readonly memorize = true

  personal$: Observable<Personal | undefined> = user(getAuth()).pipe(
    switchMap(user => user ? this.valueChanges(user.uid, { uid: user.uid }) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  fcmIsSupported = Capacitor.getPlatform() === 'web' ? isSupported() : Promise.resolve(true)
  private get localStorageName() { return `pushNotifications${this.auth.uid}` }
  fcmIsRegistered = new BehaviorSubject(false)

  form = new SettingsForm()

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    super()
    this.personal$.subscribe(personal => {
      if (personal) {
        // check if FCM is registered
        if (localStorage.getItem(this.localStorageName)) this.fcmIsRegistered.next(true)

        this.form.patchValue(personal.settings, { emitEvent: false })

        if (!personal.fcmTokens?.length) {
          const { main } = this.form.pushNotification as PushNotificationSettingsForm
          main.setValue(false, { emitEvent: false })
        }
      }
    })

    this.form.valueChanges.subscribe(() => {
      if (!this.auth.uid) return
      this.update(this.auth.uid, { settings: this.form.getRawValue() }, { params: { uid: this.auth.uid }})
    })

    const form = this.form.pushNotification as PushNotificationSettingsForm
    form.main.valueChanges.subscribe(value => {
      if (value) {
        this.registerFCM()
        form.enableControls()
      } else {
        form.disableControls()
      }
    })
  }

  protected override toFirestore(personal: Personal, actionType: 'add' | 'update'): Personal {
    const timestamp = serverTimestamp() as any

    if (actionType === 'add') personal.createdAt = timestamp
    personal.updatedAt = timestamp

    return personal
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Personal>) {
    return snapshot.exists()
      ? { ...snapshot.data(), uid: snapshot.id }
      : undefined
  }

  async getEncryptionKey(): Promise<string> {
    const uid = await this.auth.getUID()
    if (!uid) throw new Error('Should always have uid defined when getting decrypt key')
    const personal = await this.load(uid, { uid })
    if (!personal) throw new Error('Should always have personal defined when getting decrypt key')
    return personal.key
  }

  updateLastCheckedNotification() {
    if (this.auth.uid) {
      this.update(this.auth.uid, {
        lastCheckedNotifications: serverTimestamp() as any
      }, { params: { uid: this.auth.uid }})
    }
  }

  private async getPermission(): Promise<string> {
    try {
      const token = await getToken(getMessaging())
      this.addFCMToken(token)

      if (!localStorage.getItem(this.localStorageName)) {
        // turn push notifications on in settings if this is the first time
        const { main } = this.form.pushNotification as PushNotificationSettingsForm
        main.setValue(true)
      }

      localStorage.setItem(this.localStorageName, token)
      this.fcmIsRegistered.next(true)

      return token
    } catch(err) {
      const { main } = this.form.pushNotification as PushNotificationSettingsForm
      main.setValue(false)

      this.toastController.create({
        message: `Sorry, couldn't activate push notifications on this device`,
        duration: 5000,
        position: 'bottom'
      }).then(toast => toast.present())

      Sentry.captureException(err)
      return ''
    }
  }

  async unregisterFCM() {
    let token
    if (Capacitor.getPlatform() === 'web') {
      const supported = await isSupported()
      if (supported) {
        token = await getToken(getMessaging())
      }
    } else {
      //  cant get token on Android or iOS
    }

    if (token) {
      this.removeFCMToken(token)
      localStorage.removeItem(this.localStorageName)
      this.fcmIsRegistered.next(false)
    }
  }
  async registerFCM(): Promise<string | undefined> {
    if (Capacitor.getPlatform() === 'web') {
      const supported = await isSupported()
      if (supported) {
        return this.getPermission()
      } else {
        this.toastController.create({
          message: 'Sorry, this browser does not support push notifications',
          duration: 5000,
          position: 'bottom'
        }).then(toast => toast.present())
        return
      }
    } else {
      await this.registerCapacitor()
      return
    }
  }

  async addFCMToken(token: string) {
    const user = await this.auth.awaitUser()
    if (token && user?.uid) {
      this.update(user.uid, {
        fcmTokens: arrayUnion(token) as any
      }, { params: { uid: user.uid }})
    }
  }

  removeFCMToken(token: string | undefined) {
    if (token && this.auth.uid) {
      this.update(this.auth.uid, {
        fcmTokens: arrayRemove(token) as any
      }, { params: { uid: this.auth.uid }})
    }
  }

  private async registerCapacitor(): Promise<void> {
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied push notification permission')
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register()

    if (Capacitor.getPlatform() === 'ios') {
      const token = await FCM.getToken() // get FCM token instead of APNS
      this.addFCMToken(token.token)
    }
  }

  async addListenersCapacitor(): Promise<void> {

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        if (Capacitor.getPlatform() === 'ios') return // Capacitor returns APNS token instead of FCM
        this.addFCMToken(token.value)
      }
    )

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error))
      }
    )

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        const message = notification?.title || notification?.body || ''
        this.makeToast(message)
      }
    )

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        try {
          const link: string = notification.notification.data.link
          this.router.navigateByUrl(link).then(() => SplashScreen.hide())
        } catch (err) {
          Sentry.captureException(err)
        }
      }
    )

  }

  async showMessages(): Promise<Unsubscribe | undefined> {
    if (!await isSupported()) return

    return onMessage(getMessaging(), msg => {
      if (!msg.notification?.body) return
      const { body } = msg.notification
      this.makeToast(body, msg.fcmOptions?.link)
    })
  }

  private async makeToast(message: string, link?: string) {
    const options: ToastOptions = {
      message,
      duration: 5000,
      position: 'top'
    }

    if (link) {
      options.buttons = [{
        icon: 'arrow-forward',
        handler: () => {
          this.router.navigateByUrl(`/${link}`)
        },
      }]
    }

    const toast = await this.toastController.create(options)
    toast.present()
  }
}
