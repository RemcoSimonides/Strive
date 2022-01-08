import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { Share } from '@capacitor/share';
// Strive
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { enumExercises, exercises } from '@strive/exercises/utils';
import { AffirmationUpsertComponent } from '@strive/exercises/affirmation/components/upsert/upsert.component';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
import { GoalSharePopoverComponent } from '../../../popovers/share/share.component';

@Component({
  selector: 'goal-slide-5',
  templateUrl: './slide-5.component.html',
  styleUrls: ['./slide-5.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide5Component {
  @Input() form: GoalForm
  @Input() goalId: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  exercises = exercises.filter(exercise => [enumExercises.affirmations].includes(exercise.enum) )

  constructor(
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private popoverCtrl: PopoverController
  ) {}

  openExercise(enumExercise: enumExercises) {
    let component
    switch (enumExercise) {
      case enumExercises.affirmations:
        component = AffirmationUpsertComponent
        break;
    
      default:
        console.error('This exercise cant be opened')
        break;
    }
    this.modalCtrl.create({ component }).then(modal => modal.present())
  }

  async openSharePopover(ev: UIEvent) {
    const goal = this.form.value;

    if ((this.platform.is('android') || this.platform.is('ios') && !this.platform.is('mobileweb'))) {

      const isSecret = goal.publicity !== 'public'
      const ref = await this.inviteTokenService.getShareLink(this.goalId, false, isSecret, true)

      await Share.share({
        title: goal.title,
        text: 'Check out this goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event: ev,
        componentProps: {
          goal,
          isAdmin: true
        }
      }).then(popover => popover.present())
    }
  }
}