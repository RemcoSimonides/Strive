import { Injectable, inject } from '@angular/core'

import { doc, DocumentReference, docData, Firestore } from '@angular/fire/firestore'

import { Capacitor } from '@capacitor/core'
import { AppUpdate } from '@capawesome/capacitor-app-update'
import { AlertController, ToastController } from '@ionic/angular/standalone'
import { setContext } from '@sentry/angular'

interface Version {
  android: string
  ios: string
  maintenance: boolean
}

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  private firestore = inject(Firestore);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  version = "1.16.2"

  constructor() {
    setContext('version', { app_version: this.version })
  }

  checkForUpdate() {
    const docPath = `meta/version`
    const docRef = doc(this.firestore, docPath) as DocumentReference<Version>
    docData(docRef).subscribe(version => {
      if (!version) return

      if (version.maintenance) {
        this.alertCtrl.create({
          header: 'Under Maintenance',
          message: 'This should only take a few minutes',
          backdropDismiss: false
        }).then(alert => alert.present())
      } else {
        this.alertCtrl.getTop().then(alert => alert?.dismiss())
      }

      const platform = Capacitor.getPlatform() as 'web' | 'android' | 'ios'
      if (platform === 'web') return

      const available = version[platform]
      const getMajor = (value: string) => +value.split('.')[0]
      const getMinor = (value: string) => +value.split('.')[1]

      if (getMajor(this.version) < getMajor(available)) {

        this.alertCtrl.create({
          header: 'Important update available',
          message: 'Please download the latest version before continuing',
          buttons: [
            {
              text: 'Download',
              handler: () => AppUpdate.openAppStore()
            }
          ],
          backdropDismiss: false
        }).then(alert => alert.present())

      } else if (getMinor(this.version) < getMinor(available)) {

        this.toastCtrl.create({
          header: 'New version available',
          icon: 'alert-outline',
          buttons: [
            {
              text: 'UPDATE',
              handler: async () => {
                // if (this.platform === 'android' && flexibleUpdateAllowed) {
                //   AppUpdate.addListener('onFlexibleUpdateStateChange', state => {
                //     console.log('state: ', state)
                //     if (state.installStatus === FlexibleUpdateInstallStatus.INSTALLED) {
                //       AppUpdate.completeFlexibleUpdate()
                //     }
                //   })
                //   await AppUpdate.startFlexibleUpdate()
                // } else {
                await AppUpdate.openAppStore()
                // }
              }
            }
          ]
        }).then(toast => toast.present())
      }
    })
  }
}
