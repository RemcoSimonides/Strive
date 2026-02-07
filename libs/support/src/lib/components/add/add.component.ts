import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'
import { IonList, IonItem, IonInput, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone'

import { where } from '@angular/fire/firestore'

import { createSupportBase, Goal, Milestone } from '@strive/model'

import { SupportService } from '@strive/support/support.service'
import { AuthService } from '@strive/auth/auth.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component'

@Component({
    selector: '[goal] strive-support-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        IonList,
        IonItem,
        IonInput,
        IonButton,
        IonIcon,
    ]
})
export class AddSupportComponent {
  private auth = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private profileService = inject(ProfileService);
  private stakeholderService = inject(GoalStakeholderService);
  private supportService = inject(SupportService);


  @Input() goal?: Goal
  @Input() milestone?: Milestone

  form = new FormControl('', { validators: [Validators.required, Validators.maxLength(60)], nonNullable: true })

  async addSupport() {
    if (this.form.invalid) return
    const uid = this.auth.uid()
    if (!uid) return
    if (!this.goal) return

    const goalId = this.goal.id

    const support = createSupportBase({
      description: this.form.value,
      goalId: this.goal.id,
      milestoneId: this.milestone?.id,
      supporterId: uid
    })

    if (this.milestone?.achieverId) {
      support.recipientId = this.milestone.achieverId
      this.form.setValue('')
      return this.supportService.upsert(support, { goalId })
    }

    const stakeholders = await this.stakeholderService.getDocs([where('isAchiever', '==', true)], { goalId })
    const profiles = await this.profileService.getDocs(stakeholders.map(s => s.uid))
    const achievers = stakeholders.map(stakeholder => ({ ...stakeholder, profile: profiles.find(profile => profile.uid === stakeholder.uid) }))
    if (achievers.length === 1) {
      support.recipientId = achievers[0].uid
      this.form.setValue('')
      return this.supportService.upsert(support, { goalId })
    } else {
      const recipients: string[] = []
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { recipients, achievers }
      })
      modal.onDidDismiss().then(() => {
        for (const recipientId of recipients) {
          const result = createSupportBase({ ...support, recipientId })
          this.supportService.upsert(result, { goalId })
        }
      })
      modal.present()
      this.form.setValue('')
    }
    return
  }

}
