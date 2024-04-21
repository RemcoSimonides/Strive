import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { IonTitle, IonContent, ModalController } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Message } from '@strive/model'
import { AES, enc } from 'crypto-js'

import { DearFutureSelfService } from '../../dear-future-self.service'
import { AuthService } from '@strive/auth/auth.service'
import { PersonalService } from '@strive/user/personal.service'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
  standalone: true,
  selector: '[message] strive-dear-future-self-message-modal',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HeaderModalComponent,
    IonTitle,
    IonContent
  ]
})
export class MessageModalComponent extends ModalDirective implements OnInit {

  @Input() dfs?: string
  @Input() message!: Message

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private dfsService: DearFutureSelfService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private personalService: PersonalService
  ) {
    super(location, modalCtrl)
  }

  async ngOnInit() {
    if (!this.dfs) return

    const uid = await this.auth.getUID()
    if (!uid) return
    const key = await this.personalService.getEncryptionKey()

    const messages = await this.dfsService.getSettings(uid)
    if (!messages) throw new Error('no message found')

    const time = +this.dfs
    const result = messages.messages.find(m => m.createdAt.getTime() === time)
    if (result) {
      this.message = result
      this.message.description = AES.decrypt(result.description, key).toString(enc.Utf8)
      this.cdr.markForCheck()
    }
  }
}
