import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Share } from '@capacitor/share'

import { IonButton, IonIcon, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { shareSocialOutline } from 'ionicons/icons'

import { Goal } from '@strive/model'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { captureException, captureMessage } from '@sentry/capacitor'
import { GoalSharePopoverComponent } from '@strive/goal/popovers/share/share.component'

@Component({
  standalone: true,
  selector: '[goal] strive-goal-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    GoalSharePopoverComponent,
    IonButton,
    IonIcon
  ]
})
export class GoalShareComponent {

  @Input() goal?: Goal

  constructor(
    private inviteTokenService: InviteTokenService,
    private popoverCtrl: PopoverController
  ) {
    addIcons({ shareSocialOutline })
  }

  async openSharePopover(ev: UIEvent) {
    if (!this.goal) return

    const { id, title, publicity } = this.goal
    const isSecret = publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(id, isSecret, true)

    const canShare = await Share.canShare()
    if (canShare.value) {

      try {
        await Share.share({
          title,
          text: 'Check out this goal',
          url,
          dialogTitle: 'Together we achieve!'
        }).catch(err => {
          captureException(err)
        })
      } catch (err: any) {
        captureMessage(err['message'])
      }

    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event: ev,
        componentProps: { url }
      }).then(popover => popover.present())
    }
  }
}
