import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { RouterModule } from '@angular/router'

import { AlertController, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, LoadingController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { addOutline, trashOutline } from 'ionicons/icons'

import { Clipboard } from '@capacitor/clipboard'
import { collection, doc, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

import { ApiKey, createApiKey, ApiKeyScope } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { collectionData, createConverter } from '@strive/utils/firebase'
import { FIRESTORE } from '@strive/utils/firebase-init'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

const converter = createConverter<ApiKey>(createApiKey)

const AVAILABLE_SCOPES: { value: ApiKeyScope, label: string }[] = [
  { value: 'goals:read', label: 'Read Goals' },
  { value: 'goals:write', label: 'Write Goals' },
  { value: 'milestones:read', label: 'Read Milestones' },
  { value: 'milestones:write', label: 'Write Milestones' },
  { value: 'user:read', label: 'Read User' },
  { value: 'posts:read', label: 'Read Posts' },
  { value: 'supports:read', label: 'Read Supports' },
]

@Component({
  selector: 'journal-api-keys',
  templateUrl: './api-keys.component.html',
  styleUrls: ['./api-keys.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
  ]
})
export class ApiKeysComponent {
  private alertCtrl = inject(AlertController)
  private loadingCtrl = inject(LoadingController)
  private auth = inject(AuthService)
  private firestore = inject(FIRESTORE)
  private screensize = inject(ScreensizeService)

  isMobile$ = this.screensize.isMobile$
  keys = signal<ApiKey[]>([])

  constructor() {
    addIcons({ addOutline, trashOutline })

    const uid = this.auth.uid()
    if (uid) {
      const colRef = collection(this.firestore, 'ApiKeys').withConverter(converter)
      const q = query(colRef, where('uid', '==', uid), where('revoked', '==', false))
      collectionData(q, { idField: 'id' }).pipe(
        takeUntilDestroyed()
      ).subscribe(keys => this.keys.set(keys as ApiKey[]))
    }
  }

  async createKey() {
    const uid = this.auth.uid()
    if (!uid) return

    // Step 1: Prompt for key name
    const nameAlert = await this.alertCtrl.create({
      header: 'Create API Key',
      message: 'Enter a name for this key',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'e.g. My Integration' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Next', role: 'confirm' }
      ]
    })
    await nameAlert.present()
    const nameResult = await nameAlert.onDidDismiss()
    if (nameResult.role === 'cancel' || !nameResult.data?.values?.name) return
    const name = nameResult.data.values.name

    // Step 2: Select scopes
    const scopeAlert = await this.alertCtrl.create({
      header: 'Select Scopes',
      message: 'Choose what this key can access',
      inputs: AVAILABLE_SCOPES.map(scope => ({
        name: scope.value,
        type: 'checkbox' as const,
        label: scope.label,
        value: scope.value,
      })),
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Create', role: 'confirm' }
      ]
    })
    await scopeAlert.present()
    const scopeResult = await scopeAlert.onDidDismiss()
    if (scopeResult.role === 'cancel') return
    const scopes = scopeResult.data?.values as ApiKeyScope[] | undefined
    if (!scopes || scopes.length === 0) {
      const errorAlert = await this.alertCtrl.create({
        header: 'No Scopes Selected',
        message: 'You must select at least one scope.',
        buttons: ['OK']
      })
      await errorAlert.present()
      return
    }

    // Call the create function (needs server-side crypto)
    const loading = await this.loadingCtrl.create({ message: 'Creating API key...' })
    await loading.present()

    let response: { key?: string, error?: string, id?: string }
    try {
      const fn = httpsCallable(getFunctions(), 'createApiKeyCallable')
      const result = await fn({ name, scopes })
      response = result.data as { key?: string, error?: string, id?: string }
    } catch {
      await loading.dismiss()
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Failed to create API key. Please try again.',
        buttons: ['OK']
      })
      await errorAlert.present()
      return
    }

    await loading.dismiss()

    if (response.error) {
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: response.error,
        buttons: ['OK']
      })
      await errorAlert.present()
      return
    }

    // Step 3: Show the raw key (Firestore listener will auto-update the list)
    if (response.key) {
      const keyAlert = await this.alertCtrl.create({
        header: 'API Key Created',
        message: "Copy this key now. You won't be able to see it again.",
        inputs: [
          { name: 'key', type: 'text', value: response.key, attributes: { readonly: true } }
        ],
        buttons: [
          {
            text: 'Copy & Close',
            handler: () => {
              Clipboard.write({ string: response.key ?? '' })
            }
          }
        ]
      })
      await keyAlert.present()
    }
  }

  async revokeKey(key: ApiKey) {
    const alert = await this.alertCtrl.create({
      header: 'Revoke API Key',
      message: `Are you sure you want to revoke "${key.name}" (${key.prefix}...)?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Revoke',
          role: 'destructive',
          handler: async () => {
            const docRef = doc(this.firestore, `ApiKeys/${key.id}`)
            await updateDoc(docRef, { revoked: true, updatedAt: serverTimestamp() })
          }
        }
      ]
    })
    await alert.present()
  }
}
