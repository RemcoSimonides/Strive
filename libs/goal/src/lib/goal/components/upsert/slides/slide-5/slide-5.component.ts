import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Platform, PopoverController } from '@ionic/angular';
import { Share } from '@capacitor/share';
// Strive
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { enumExercises, exercises } from '@strive/exercises/utils';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { GoalSharePopoverComponent } from '../../../popovers/share/share.component';
import { createGoal } from '@strive/model'

@Component({
  selector: '[form][goalId] goal-slide-5',
  templateUrl: './slide-5.component.html',
  styleUrls: ['./slide-5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide5Component {
  @Input() form!: GoalForm
  @Input() goalId!: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  exercises = exercises.filter(exercise => [enumExercises.affirmations, enumExercises.daily_gratefulness].includes(exercise.enum) )

  constructor(
    private inviteTokenService: InviteTokenService,
    private platform: Platform,
    private popoverCtrl: PopoverController
  ) {}

  async openSharePopover(ev: UIEvent) {
    const goal = createGoal({ ...this.form.value, id: this.goalId })
    const path = `goal/${this.goalId}`

    const isSecret = goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goalId, isSecret, true, path)

    const canShare = await Share.canShare()
    if (canShare.value) {

      await Share.share({
        title: goal.title,
        text: 'Check out this goal',
        url,
        dialogTitle: 'Together we achieve!'
      })

    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event: ev,
        componentProps: { url }
      }).then(popover => popover.present())
    }
  }
}