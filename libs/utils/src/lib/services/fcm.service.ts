import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ToastController, Platform } from '@ionic/angular';
import { PushNotifications, PushNotificationSchema, Token, ActionPerformed } from '@capacitor/push-notifications';
import { tap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserService } from '@strive/user/user/+state/user.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private afMessaging: AngularFireMessaging,
    private fun: AngularFireFunctions,
    private toastController: ToastController,
    private _platform: Platform,
    private user: UserService
  ) { }

  private async getPermission() {
    const token = await this.afMessaging.requestToken.pipe(take(1)).toPromise()
    console.log('Permission granted! Save to the server!', token);
    this.user.addFCMToken(token);
  }

  async registerFCM(): Promise<void> {
    // if ((this._platform.is('android') || this._platform.is('ios')) && !this._platform.is('mobileweb')) {
    //   await this.registerCapacitor()
    // } else {
    //   await this.getPermission()
    // }
    this.getPermission();
  }

  private async registerCapacitor(): Promise<void> {

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

  }

  async addListenersCapacitor(): Promise<void> {

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: Token) => {
        this.user.addFCMToken(token.value)
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

  showMessages(): Observable<any> {
    return this.afMessaging.messages.pipe(
      tap(msg => {
        const body: any = (msg as any).notification.body;
        console.log('msg body', body)
        this.makeToast(body);
      })
    );
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
