import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, ViewChild, inject } from '@angular/core'
import { Router } from '@angular/router'

import { AlertController, IonButton, IonIcon, IonItem, IonList, IonPopover, IonSpinner, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { flagOutline } from 'ionicons/icons'

import { getFunctions, httpsCallable } from 'firebase/functions'
import { BehaviorSubject } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { Goal, GoalStakeholder } from '@strive/model'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'

@Pipe({ name: 'joinButtonText', standalone: true })
export class JoinButtonTextPipe implements PipeTransform {
  transform(stakeholder: GoalStakeholder, collectiveGoalStakeholder?: GoalStakeholder) {
    if (stakeholder.isAchiever) return 'Joined'
    if (stakeholder.hasOpenRequestToJoin) return 'Cancel request'
    if (collectiveGoalStakeholder?.isAchiever) return 'Joined'
    return 'Join'
  }
}

@Component({
    selector: '[goal][stakeholder] strive-goal-join-button',
    templateUrl: './join-button.component.html',
    styleUrls: ['./join-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        JoinButtonTextPipe,
        IonIcon,
        IonPopover,
        IonList,
        IonItem,
        IonButton,
        IonSpinner
    ]
})
export class JoinButtonComponent {
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  private stakeholderService = inject(GoalStakeholderService);


  status$ = new BehaviorSubject<'choose' | 'creating' | 'created' | 'requested'>('choose')

  @Input() goal!: Goal
  @Input() stakeholder!: GoalStakeholder
  @Input() collectiveStakeholder?: GoalStakeholder

  @ViewChild(IonPopover) popover?: IonPopover

  constructor() {
    addIcons({ flagOutline })
  }

  async join() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.join()
      })
      return modal.present()
    }

    const { isAchiever, hasOpenRequestToJoin } = this.stakeholder
    const goalId = this.goal.id

    if (hasOpenRequestToJoin) {
      return this.alertCtrl.create({
        subHeader: 'Are you sure you want to cancel your request to join goal?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.stakeholderService.update({
                uid: this.auth.uid,
                hasOpenRequestToJoin: false
              }, { params: { goalId } })
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ]
      }).then(alert => alert.present())
    }

    if (this.collectiveStakeholder?.isAchiever) {
      this.router.navigate(['/goal', this.collectiveStakeholder.goalId])
      return
    }

    if (!isAchiever && !hasOpenRequestToJoin) {
      if (!this.popover) throw new Error('Popover undefined')
      this.popover.onDidDismiss().then(() => this.status$.next('choose'))
      this.popover?.present()
      return
    }

    return this.alertCtrl.create({
      subHeader: 'Are you sure you no longer want to be an achiever in this goal?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.stakeholderService.update({
              uid: this.auth.uid,
              isAchiever: false
            }, { params: { goalId } })
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  joinGoal() {
    const { isAdmin, hasInviteToJoin } = this.stakeholder
    const goalId = this.goal.id

    if (isAdmin || hasInviteToJoin) {
      this.stakeholderService.update({
        uid: this.auth.uid,
        isAchiever: true
      }, { params: { goalId } })
      this.popover?.dismiss()
    } else {
      this.stakeholderService.upsert({
        uid: this.auth.uid,
        goalId,
        isSpectator: true,
        hasOpenRequestToJoin: true
      }, { params: { goalId } })
      this.status$.next('requested')
    }
  }

  async createCollectiveGoal() {
    this.status$.next('creating')

    const createCollectiveGoalFn = httpsCallable(getFunctions(), 'createCollectiveGoal')
    const collectiveGoal = await createCollectiveGoalFn({
      goal: this.goal,
      uid: this.auth.uid
    })

    this.status$.next('created')

    const { result } = collectiveGoal.data as { error: string, result: string }
    if (result) this.router.navigate(['/goal', result])
  }

  dismiss() {
    this.popover?.dismiss()
  }
}
