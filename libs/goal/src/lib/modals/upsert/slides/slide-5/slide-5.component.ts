import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { Share } from '@capacitor/share'
// Strive
import { GoalForm } from '@strive/goal/forms/goal.form'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { GoalSharePopoverComponent } from '../../../../popovers/share/share.component'
import { createGoal, exercises } from '@strive/model'
import { captureException, captureMessage } from '@sentry/capacitor'

@Component({
  selector: '[form][goalId] strive-goal-slide-5',
  templateUrl: './slide-5.component.html',
  styleUrls: ['./slide-5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide5Component {
  @Input() form!: GoalForm
  @Input() goalId!: string

  exercises = exercises.filter(exercise => ['affirmations', 'daily_gratitude', 'dear_future_self'].includes(exercise.id) )

  constructor(
    private inviteTokenService: InviteTokenService,
    private popoverCtrl: PopoverController
  ) {}

  async openSharePopover(ev: UIEvent) {
    const goal = createGoal({ ...this.form.getGoalValue(), id: this.goalId })

    const isSecret = goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goalId, isSecret, true)

    const canShare = await Share.canShare()
    if (canShare.value) {

      try {
        await Share.share({
          title: goal.title,
          text: 'Check out this goal',
          url,
          dialogTitle: 'Together we achieve!'
        }).catch(err => {
          captureException(err)
        })
      } catch(err: any) {
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