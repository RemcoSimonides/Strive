import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage, Unsubscribe } from '@angular/fire/messaging';
import { ToastController } from '@ionic/angular';
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { PersonalService } from '@strive/user/personal/personal.service';


@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private messaging: Messaging,
    private toastController: ToastController,
    private personal: PersonalService
  ) { }

  private async getPermission() {
    try {
      const token = await getToken(this.messaging)
      console.log('Permission granted! Save to the server!', token)

      this.personal.addFCMToken(token)
      return token
    } catch(err) {
      this.toastController.create({
        message: 'Something went wrong',
        duration: 5000,
        position: 'bottom',
      }).then(toast => toast.present())
    }

  }

  async registerFCM() {
    // if ((this._platform.is('android') || this._platform.is('ios')) && !this._platform.is('mobileweb')) {
    //   await this.registerCapacitor()
    // } else {
    //   await this.getPermission()
    // }
    return this.getPermission();
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
        this.makeToast(notification)
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

  showMessages(): Unsubscribe {
    return onMessage(this.messaging, msg => {
      const { body } = msg.notification;
      this.makeToast(body)
    })
  }

  // sub(topic) {
  //   this.fun
  //     .httpsCallable('subscribeToTopic')({ topic, token: this.token })
  //     .pipe(tap(_ => this.makeToast(`subscribed to ${topic}`)))
  //     .subscribe();

  //   console.log('token', this.token)
  // }

  // unsub(topic) {
  //   this.fun
  //     .httpsCallable('unsubscribeFromTopic')({ topic, token: this.token })
  //     .pipe(tap(_ => this.makeToast(`unsubscribed from ${topic}`)))
  //     .subscribe();
  // }

  async makeToast(message) {
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
