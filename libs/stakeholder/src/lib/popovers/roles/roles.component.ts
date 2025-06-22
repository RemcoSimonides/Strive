
import { ChangeDetectionStrategy, Component, HostListener, Input, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonList, IonItem, IonLabel, AlertController, PopoverController } from '@ionic/angular/standalone'
import { GoalStakeholder, User } from '@strive/model'
import { GoalStakeholderService } from '../../stakeholder.service'

@Component({
    imports: [
    ReactiveFormsModule,
    IonList,
    IonItem,
    IonLabel
],
    selector: '[goalId][stakeholder] strive-stakeholder-roles',
    templateUrl: './roles.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesPopoverComponent {
	private alertCtrl = inject(AlertController);
	private popoverCtrl = inject(PopoverController);
	private stakeholderService = inject(GoalStakeholderService);

	@HostListener('window:popstate', ['$event'])
	onPopState() { this.popoverCtrl.dismiss() }

	@Input() goalId!: string
	@Input() stakeholder!: GoalStakeholder & { profile: User }
	@Input() manageRoles = false

	toggleAdmin() {
		this.popoverCtrl.dismiss()
		if (!this.goalId) return
		this.stakeholderService.upsert({
			uid: this.stakeholder.uid,
			isAdmin: !this.stakeholder.isAdmin
		}, { params: { goalId: this.goalId } })
	}

	toggleAchiever() {
		this.popoverCtrl.dismiss()
		if (!this.goalId) return
		this.stakeholderService.upsert({
			uid: this.stakeholder.uid,
			isAchiever: !this.stakeholder.isAchiever
		}, { params: { goalId: this.goalId } })
	}

	async remove() {
		this.popoverCtrl.dismiss()

		const { isSupporter } = this.stakeholder
		return this.alertCtrl.create({
			subHeader: `Are you sure you want to remove ${this.stakeholder.profile.username} from this goal?`,
			message: isSupporter ? `${this.stakeholder.profile.username}'s supports will be removed` : '',
			buttons: [
				{
					text: 'Yes',
					handler: async () => {
						this.stakeholderService.remove(this.stakeholder.uid, { params: { goalId: this.goalId } })
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
