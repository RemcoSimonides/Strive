import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AlertController, ModalController } from '@ionic/angular'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { Goal, GoalStakeholder } from '@strive/model'
import { AuthService } from '@strive/user/auth/auth.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'

@Component({
  selector: '[goal][stakeholder] goal-join-button',
  templateUrl: './join-button.component.html',
  styleUrls: ['./join-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinButtonComponent {

  @Input() goal!: Goal
  @Input() stakeholder!: GoalStakeholder

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private modalCtrl: ModalController,
    private stakeholderService: GoalStakeholderService
  ) {}

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

    const { isAchiever, isAdmin, hasOpenRequestToJoin} = this.stakeholder
    const goalId = this.goal.id

    if (!isAchiever && !hasOpenRequestToJoin) {
      if (isAdmin) {
        return this.stakeholderService.update({
          uid: this.auth.uid,
          isAchiever: true
        }, { params: { goalId }})
      } else {
        return this.stakeholderService.upsert({
          uid: this.auth.uid,
          goalId,
          isSpectator: true,
          hasOpenRequestToJoin: true
        }, { params: { goalId }})
      }
    }

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
              }, { params: { goalId }})
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ]
      }).then(alert => alert.present())
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
            }, { params: { goalId }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
}