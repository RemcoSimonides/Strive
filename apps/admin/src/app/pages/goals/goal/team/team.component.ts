import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { createGoalStakeholder, GoalStakeholder } from '@strive/model'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { SelectUserModalComponent } from '@strive/ui/select-user/select-user.modal';
import { UserService } from '@strive/user/user/user.service';
import { Observable } from 'rxjs';


@Component({
  selector: '[id] strive-team',
  templateUrl: './team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {

	stakeholders$: Observable<GoalStakeholder[]>

	@Input() id: string

  constructor(
    private modalCtrl: ModalController,
    private user: UserService,
		private stakeholder: GoalStakeholderService
  ) {}

	ngOnInit() {
		this.stakeholders$ = this.stakeholder.valueChanges({ goalId: this.id })
	}

  async add() {
    const modal = await this.modalCtrl.create({ component: SelectUserModalComponent })
    modal.onDidDismiss().then(async res => {
      const uid = res.data as string
      if (uid) {
        const { username, photoURL } = await this.user.getValue(uid, { uid })
        const stakeholder = createGoalStakeholder({ username, photoURL, uid });
        this.stakeholder.upsert(stakeholder, { params: { goalId: this.id }});
      }
    })
    modal.present();
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
