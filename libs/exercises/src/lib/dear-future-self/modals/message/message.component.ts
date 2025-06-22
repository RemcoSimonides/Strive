import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core'
import { CommonModule, Location } from '@angular/common';
import { IonTitle, IonContent, ModalController } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Message } from '@strive/model'
import { AES, enc } from 'crypto-js'

import { DearFutureSelfService } from '../../dear-future-self.service'
import { AuthService } from '@strive/auth/auth.service'
import { PersonalService } from '@strive/user/personal.service'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
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
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private dfsService = inject(DearFutureSelfService);
  protected override location: Location;
  protected override modalCtrl: ModalController;
  private personalService = inject(PersonalService);


  @Input() dfs?: string
  @Input() message!: Message

  constructor() {
    const location = inject(Location);
    const modalCtrl = inject(ModalController);

    super(location, modalCtrl)

    this.location = location;
    this.modalCtrl = modalCtrl;
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
