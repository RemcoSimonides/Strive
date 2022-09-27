import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { ToastController, ToastOptions } from '@ionic/angular'

import { arrayRemove, arrayUnion, DocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import { getToken, getMessaging, onMessage, Unsubscribe, isSupported } from 'firebase/messaging'
import { FireSubCollection } from 'ngfire'
import { getAuth } from 'firebase/auth'

import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications'

import { user } from 'rxfire/auth'
import { Observable, of, switchMap, shareReplay, BehaviorSubject } from 'rxjs'
import * as Sentry from '@sentry/capacitor'

import { Personal } from '@strive/model'

import { AuthService } from '../auth/auth.service'


@Injectable({ providedIn: 'root' })
export class PersonalService extends FireSubCollection<Personal> {
  readonly path = 'Users/:uid/Personal'
  override readonly idKey = 'uid'
  override readonly memorize = true

  personal$: Observable<Personal | undefined> = user(getAuth()).pipe(
    switchMap(user => user ? this.valueChanges(user.uid, { uid: user.uid }) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  fcmIsSupported = isSupported()
  fcmActive$ = new BehaviorSubject(false)
  private get localStorageName() { return `pushNotifications${this.auth.uid}` }

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    super()
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
      localStorage.setItem(this.localStorageName, token)
      this.fcmActive$.next(true)
      return token
    } catch(err) {
      this.fcmActive$.next(false)
      this.toastController.create({
        message: 'Something went wrong. Try again',
        duration: 5000,
        position: 'bottom',
      }).then(toast => toast.present())
      Sentry.captureException(err)
      return ''
    }
  }

  async unregisterFCM() {
    try {
      const token = await getToken(getMessaging())
      this.removeFCMToken(token)
      localStorage.removeItem(this.localStorageName)
      this.fcmActive$.next(false)
    } catch(err) {
      this.toastController.create({
        message: 'Something went wrong',
        duration: 5000,
        position: 'bottom',
      }).then(toast => toast.present())
    }
  }

  async registerFCM(): Promise<string | undefined> {
    // if ((this._platform.is('android') || this._platform.is('ios')) && !this._platform.is('mobileweb')) {
    //   await this.registerCapacitor()
    // }

    const fcm = await isSupported()
    if (fcm) {
      return this.getPermission()
    } else {
      this.toastController.create({
        message: 'Sorry, this browser does not support push notifications',
        duration: 5000,
        position: 'bottom'
      })
      return
    }
  }

  addFCMToken(token: string) {
    if (token && this.auth.uid) {
      this.update(this.auth.uid, {
        fcmTokens: arrayUnion(token) as any
      }, { params: { uid: this.auth.uid }})
    }
  }

  removeFCMToken(token: string) {
    if (token && this.auth.uid) {
      this.update(this.auth.uid, {
        fcmTokens: arrayRemove(token) as any
      }, { params: { uid: this.auth.uid }})
    }
  }

  private async registerCapacitor(): Promise<void> {

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

  }

  async addListenersCapacitor(): Promise<void> {

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        this.addFCMToken(token.value)
        console.log('Push registration success, token: ' + token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log('Error on registration: ' + JSON.stringify(error));
      }
    );

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        const message = notification?.title || notification?.body || ''
        this.makeToast(message)
        console.log('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      }
    );

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
    toast.present();
  }
}
