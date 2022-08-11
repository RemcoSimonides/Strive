import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { GoalStakeholder } from '@strive/model';
import { delay } from '@strive/utils/helpers';
import { GoalStakeholderService } from '../../stakeholder.service';

@Component({
	selector: '[goalId][stakeholder] goal-stakeholder-roles',
	templateUrl: './roles.component.html',
	styleUrls: ['./roles.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesPopoverComponment {
	@Input() goalId!: string
	@Input() stakeholder!: GoalStakeholder

	constructor(
    private location: Location,
		private popoverCtrl: PopoverController,
    private router: Router,
		private stakeholderService: GoalStakeholderService
	) {}

	toggleAdmin() {
    this.popoverCtrl.dismiss()
    if (!this.goalId) return
    this.stakeholderService.upsert({
      uid: this.stakeholder.uid,
      isAdmin: !this.stakeholder.isAdmin
    }, { params: { goalId: this.goalId }})
  }

  navTo() {
    this.popoverCtrl.dismiss()
    this.location.back()
    delay(250).then(_ => {
      this.router.navigate(['/profile/', this.stakeholder.uid])
    })
  }
}
