import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { RouterModule } from '@angular/router'

import { AlertController, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { addOutline, trashOutline } from 'ionicons/icons'

import { Clipboard } from '@capacitor/clipboard'
import { getFunctions, httpsCallable } from 'firebase/functions'

import { ApiKeyScope } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

interface ApiKeyListItem {
  id: string
  name: string
  prefix: string
  scopes: ApiKeyScope[]
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

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
  private auth = inject(AuthService)
  private screensize = inject(ScreensizeService)

  isMobile$ = this.screensize.isMobile$
  keys = signal<ApiKeyListItem[]>([])

  constructor() {
    addIcons({ addOutline, trashOutline })
    this.loadKeys()
  }

  async loadKeys() {
    const uid = this.auth.uid()
    if (!uid) return

    const fn = httpsCallable(getFunctions(), 'listApiKeysCallable')
    const result = await fn({})
    const response = result.data as { data?: ApiKeyListItem[], error?: string }
    if (response.data) {
      this.keys.set(response.data)
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

    // Call the create function
    const fn = httpsCallable(getFunctions(), 'createApiKeyCallable')
    const result = await fn({ name, scopes })
    const response = result.data as { key?: string, error?: string, id?: string }

    if (response.error) {
      const errorAlert = await this.alertCtrl.create({
        header: 'Error',
        message: response.error,
        buttons: ['OK']
      })
      await errorAlert.present()
      return
    }

    // Step 3: Show the raw key
    if (response.key) {
      const keyAlert = await this.alertCtrl.create({
        header: 'API Key Created',
        message: `Copy this key now. You won't be able to see it again.<br><br><strong>${response.key}</strong>`,
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

    await this.loadKeys()
  }

  async revokeKey(key: ApiKeyListItem) {
    const alert = await this.alertCtrl.create({
      header: 'Revoke API Key',
      message: `Are you sure you want to revoke "${key.name}" (${key.prefix}...)?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Revoke',
          role: 'destructive',
          handler: async () => {
            const fn = httpsCallable(getFunctions(), 'revokeApiKeyCallable')
            await fn({ keyId: key.id })
            await this.loadKeys()
          }
        }
      ]
    })
    await alert.present()
  }
}
