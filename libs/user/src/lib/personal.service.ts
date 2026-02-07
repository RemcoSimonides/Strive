import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'
import { ToastController, ToastOptions } from '@ionic/angular/standalone'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'
import { FCM } from '@capacitor-community/fcm'

import { Firestore, setDoc, getDoc, docData as _docData, collectionData as _collectionData } from '@angular/fire/firestore'
import { doc, arrayUnion, arrayRemove, serverTimestamp, QueryConstraint, collection, query } from 'firebase/firestore'
import { getToken, getMessaging, onMessage, Unsubscribe, isSupported } from 'firebase/messaging'

import { createConverter } from '@strive/utils/firebase'
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications'
import { captureException } from '@sentry/angular'
import { Observable, of, switchMap, shareReplay, BehaviorSubject } from 'rxjs'

import { createPersonal, Personal } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { PushNotificationSettingsForm, SettingsForm } from './forms/settings.form'

const converter = createConverter<Personal>(createPersonal, 'uid')

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private firestore = inject(Firestore)
  private auth = inject(AuthService)
  private router = inject(Router)
  private toastController = inject(ToastController)

  fcmIsSupported = Capacitor.getPlatform() === 'web' ? isSupported() : Promise.resolve(true)
  private get localStorageName() { return `pushNotifications${this.auth.uid()}` }
  fcmIsRegistered = new BehaviorSubject(false)

  form = new SettingsForm()

  personal$: Observable<Personal | undefined> = this.auth.uid$.pipe(
    switchMap(uid => {
      if (!uid) return of(undefined)
      return _docData(this.getDocRef(uid))
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  constructor() {
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
      const uid = this.auth.uid()
      if (!uid) return
      this.updateSettings(uid, this.form.getRawValue())
    })
  }

  private getDocRef(uid: string) {
    return doc(this.firestore, `Users/${uid}/Personal/${uid}`).withConverter(converter)
  }

  docData(uid: string): Observable<Personal | undefined> {
    const docPath = `Users/${uid}/Personal/${uid}`
    const docRef = doc(this.firestore, docPath).withConverter(converter)
    return _docData(docRef)
  }

  collectionData(constraints: QueryConstraint[], options: { uid: string }): Observable<Personal[]> {
    const colPath = `Users/${options.uid}/Personal`
    const colRef = collection(this.firestore, colPath).withConverter(converter)
    const q = query(colRef, ...constraints)
    return _collectionData(q)
  }

  getDoc(uid: string): Promise<Personal | undefined> {
    const docPath = `Users/${uid}/Personal/${uid}`
    const docRef = doc(this.firestore, docPath).withConverter(converter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  upsert(personal: Partial<Personal>, options: { uid: string }) {
    const docPath = `Users/${options.uid}/Personal/${options.uid}`
    const docRef = doc(this.firestore, docPath).withConverter(converter)
    return setDoc(docRef, personal as any, { merge: true })
  }

  private async updateSettings(uid: string, settings: any) {
    const ref = this.getDocRef(uid)
    return setDoc(ref, { settings } as any, { merge: true })
  }

  private async updateFields(uid: string, data: Partial<Personal>) {
    const ref = this.getDocRef(uid)
    return setDoc(ref, data, { merge: true })
  }

  async getEncryptionKey(): Promise<string> {
    const uid = await this.auth.getUID()
    if (!uid) throw new Error('Should always have uid defined when getting decrypt key')

    const snapshot = await getDoc(this.getDocRef(uid))
    const personal = snapshot.data()

    if (!personal) throw new Error('Should always have personal defined when getting decrypt key')
    return personal.key
  }

  updateLastCheckedNotification() {
    const uid = this.auth.uid()
    if (uid) {
      this.updateFields(uid, {
        lastCheckedNotifications: serverTimestamp() as any
      })
    }
  }

  async addFCMToken(token: string) {
    const user = await this.auth.getUser()
    if (token && user?.uid) {
      this.updateFields(user.uid, {
        fcmTokens: arrayUnion(token) as any
      })
    }
  }

  removeFCMToken(token: string | undefined) {
    const uid = this.auth.uid()
    if (token && uid) {
      this.updateFields(uid, {
        fcmTokens: arrayRemove(token) as any
      })
    }
  }

  /**
   * @param showError Show error message if permission is denied
   * @param force Toggle setting to true if permission is granted despite not being set before
   * @returns Token
   */
  private async getPermission(showError: boolean, force: boolean): Promise<string> {
    try {
      const token = await getToken(getMessaging())
      this.addFCMToken(token)

      const { main } = this.form.pushNotification as PushNotificationSettingsForm
      if (main.value === null || force) main.setValue(true)

      localStorage.setItem(this.localStorageName, token)
      this.fcmIsRegistered.next(true)

      return token
    } catch (err) {
      const { main } = this.form.pushNotification as PushNotificationSettingsForm
      if (force) main.setValue(false)

      if (showError) {
        this.toastController.create({
          message: `Sorry, couldn't activate push notifications on this device`,
          duration: 5000,
          position: 'bottom'
        }).then(toast => toast.present())
      }

      captureException(err)
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
      // cant get token on Android or iOS
    }

    if (token) {
      this.removeFCMToken(token)
      localStorage.removeItem(this.localStorageName)
      this.fcmIsRegistered.next(false)
    }
  }

  async registerFCM(showError: boolean, force: boolean): Promise<string | undefined> {
    if (Capacitor.getPlatform() === 'web') {
      const supported = await isSupported()
      if (supported) {
        return this.getPermission(showError, force)
      } else {
        this.toastController.create({
          message: 'Sorry, this browser does not support push notifications',
          duration: 5000,
          position: 'bottom'
        }).then(toast => toast.present())
        return
      }
    } else {
      await this.registerCapacitor(force)
      return
    }
  }

  private async registerCapacitor(force: boolean): Promise<void> {
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied push notification permission')
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register()

    // update main setting on push notifications if value is currenlty null or forced via settings
    const { main } = this.form.pushNotification as PushNotificationSettingsForm
    if (main.value === null || force) main.setValue(true)

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
        const { link } = notification.data
        this.makeToast(message, link)
      }
    )

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        try {
          const link: string = notification.notification.data.link
          this.router.navigateByUrl(link).then(() => SplashScreen.hide())
        } catch (err) {
          captureException(err)
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
      if (this.router.url.includes(link)) return // dont show notification if user is already on the page

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