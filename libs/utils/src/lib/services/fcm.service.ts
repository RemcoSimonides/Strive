import { Injectable } from '@angular/core';
import { getToken, getMessaging, onMessage, Unsubscribe, isSupported } from 'firebase/messaging';
import { ToastController } from '@ionic/angular';
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { PersonalService } from '@strive/user/personal/personal.service';
import * as Sentry from '@sentry/capacitor';
import { UserService } from '@strive/user/user/user.service';
import { BehaviorSubject, lastValueFrom, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  fcmIsSupported = isSupported()

  fcmActive$ = new BehaviorSubject(false)

  private get localStorageName() { return `pushNotifications${this.user.uid}` }

  constructor(
    private personal: PersonalService,
    private toastController: ToastController,
    private user: UserService 
  ) {
    lastValueFrom(this.user.uid$.pipe(take(2))).then(uid => {
      const name = `pushNotifications${uid}`
      const storage = localStorage.getItem(name) ?? false
      const result = storage === 'false' || storage === false ? false : true
      this.fcmActive$.next(result)
    })
  }

  private async getPermission(): Promise<string> {
    try {
      const token = await getToken(getMessaging())
      this.personal.addFCMToken(token)
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
      this.personal.removeFCMToken(token)
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

  private async registerCapacitor(): Promise<void> {

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

  }

  async addListenersCapacitor(): Promise<void> {

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        this.personal.addFCMToken(token.value)
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
      this.makeToast(body)
    })
  }

  async makeToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      buttons: [{
        text: 'dismiss',
        role: 'close'
      }]
    });
    toast.present();
  }
}
