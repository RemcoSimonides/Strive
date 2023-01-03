import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { createGoalStakeholder, GoalStakeholder, User } from '@strive/model'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { SelectUserModalComponent } from '@strive/ui/select-user/select-user.modal'
import { Observable } from 'rxjs'
import { joinWith } from 'ngfire'
import { ProfileService } from '@strive/user/profile.service'


@Component({
  selector: '[id] strive-team',
  templateUrl: './team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {

	stakeholders$?: Observable<(GoalStakeholder & { profile: User })[]>

	@Input() id!: string

  constructor(
    private modalCtrl: ModalController,
    private profileService: ProfileService,
		private stakeholder: GoalStakeholderService
  ) {}

	ngOnInit() {
		this.stakeholders$ = this.stakeholder.valueChanges({ goalId: this.id }).pipe(
      joinWith({
        profile: stakeholder => this.profileService.valueChanges(stakeholder.uid)
      }, { shouldAwait: true })
    ) as Observable<any[]>
	}

  async add() {
    const modal = await this.modalCtrl.create({ component: SelectUserModalComponent })
    modal.onDidDismiss().then(async res => {
      const uid = res.data as string
      if (uid) {
        const stakeholder = createGoalStakeholder({ uid })
        this.stakeholder.upsert(stakeholder, { params: { goalId: this.id }})
      }
    })
    modal.present()
  }

  toggleAdmin(stakeholder: GoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()

    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isAdmin: !stakeholder.isAdmin
    }, { params: { goalId: this.id }})
  }

  toggleAchiever(stakeholder: GoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()
    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isAchiever: !stakeholder.isAchiever
    }, { params: { goalId: this.id }})
  }

  toggleSupporter(stakeholder: GoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()
    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isSupporter: !stakeholder.isSupporter
    }, { params: { goalId: this.id }})
  }
}
