import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostListener, Input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonList, IonItem, IonLabel, AlertController, PopoverController } from '@ionic/angular/standalone'
import { GoalStakeholder, User } from '@strive/model'
import { GoalStakeholderService } from '../../stakeholder.service'

@Component({
    imports: [
        CommonModule,
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
	@HostListener('window:popstate', ['$event'])
	onPopState() { this.popoverCtrl.dismiss() }

	@Input() goalId!: string
	@Input() stakeholder!: GoalStakeholder & { profile: User }
	@Input() manageRoles = false

	constructor(
		private alertCtrl: AlertController,
		private popoverCtrl: PopoverController,
		private stakeholderService: GoalStakeholderService
	) { }

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
