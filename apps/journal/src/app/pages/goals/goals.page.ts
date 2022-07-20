import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

// Rxjs
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators';

// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { UserService } from '@strive/user/user/+state/user.service';

// Interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'

// Pages
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component';
import { exercises } from '@strive/exercises/utils';
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: 'journal-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsComponent {

  achievingGoals$: Observable<{ goal: Goal, stakeholder: GoalStakeholder}[]>
  exercises = exercises

  constructor(
    public user: UserService,
    private goal: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.achievingGoals$ = this.user.user$.pipe(
      switchMap(user => user ? this.goal.getStakeholderGoals(user.uid, enumGoalStakeholder.achiever, false) : of([]))
    )

    this.seo.generateTags({ title: `Goals  & Exercises- Strive Journal` })
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  createGoal() {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => modal.present())
  }

  openGoalOptions(goal: Goal, stakeholder: GoalStakeholder, ev: UIEvent) {
    ev.stopPropagation()
    ev.preventDefault()

    this.popoverCtrl.create({
      component: GoalOptionsComponent,
      componentProps: { goal, stakeholder },
      event: ev
    }).then(popover => popover.present())
  }
}
