import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ModalController } from '@ionic/angular/standalone'

import { where } from 'firebase/firestore'

import { createSupportBase, Goal, Milestone } from '@strive/model'

import { SupportService } from '@strive/support/support.service'
import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'

import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component'
import { AuthModalComponent } from '@strive/auth/components/auth-modal/auth-modal.page'

@Component({
  selector: '[goal] strive-support-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSupportComponent {

  @Input() goal?: Goal
  @Input() milestone?: Milestone

  form = new FormControl('', { validators: [Validators.required, Validators.maxLength(60)], nonNullable: true })

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private profileService: ProfileService,
    private stakeholderService: GoalStakeholderService,
    private supportService: SupportService
  ) { }

  async addSupport() {
    if (this.form.invalid) return
    if (!this.auth.uid) return
    if (!this.goal) return

    const goalId = this.goal.id

    const support = createSupportBase({
      description: this.form.value,
      goalId: this.goal.id,
      milestoneId: this.milestone?.id,
      supporterId: this.auth.uid
    })

    if (this.milestone?.achieverId) {
      support.recipientId = this.milestone.achieverId
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId } })
    }

    const stakeholders = await this.stakeholderService.getValue([where('isAchiever', '==', true)], { goalId })
    const profiles = await this.profileService.getValue(stakeholders.map(a => a.uid))
    const achievers = stakeholders.map(stakeholder => ({ ...stakeholder, profile: profiles.find(profile => profile.uid === stakeholder.uid) }))
    if (achievers.length === 1) {
      support.recipientId = achievers[0].uid
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId } })
    } else {
      const recipients: string[] = []
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { recipients, achievers }
      })
      modal.onDidDismiss().then(() => {
        for (const recipientId of recipients) {
          const result = createSupportBase({ ...support, recipientId })
          this.supportService.add(result, { params: { goalId } })
        }
      })
      modal.present()
      this.form.setValue('')
    }
    return
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent
    }).then(modal => modal.present())
  }
}
