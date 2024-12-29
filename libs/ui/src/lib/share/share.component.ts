import { Component, Input } from '@angular/core'

import { Clipboard } from '@capacitor/clipboard'

import { IonButton, IonIcon } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { clipboard } from 'ionicons/icons'

@Component({
    selector: '[url] strive-share',
    templateUrl: './share.component.html',
    styleUrls: ['./share.component.scss'],
    imports: [
        IonButton,
        IonIcon
    ]
})
export class ShareComponent {

  @Input() url!: string

  isCopied = false

  constructor() {
    addIcons({ clipboard })
  }

  copyUrl() {
    Clipboard.write({ string: this.url })
    this.isCopied = true
  }
}
