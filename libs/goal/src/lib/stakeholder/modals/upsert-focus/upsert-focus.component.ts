import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { GoalStakeholder } from '@strive/model'
import { UserService } from '@strive/user/user/user.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { debounceTime } from 'rxjs'
import { FocusForm } from '../../forms/focus.form'
import { GoalStakeholderService } from '../../stakeholder.service'

@Component({
	selector: '[stakeholder] goal-focus-modal',
	templateUrl: './upsert-focus.component.html',
	styleUrls: ['./upsert-focus.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocusModalComponent extends ModalDirective {
	form = new FocusForm()
	
	private goalId = ''
	@Input() set stakeholder(stakeholder: GoalStakeholder) {
		this.form.patchValue(stakeholder.focus, { emitEvent: false })
		this.goalId = stakeholder.goalId
	}

	constructor(
		private cdr: ChangeDetectorRef,
		protected override location: Location,
		protected override modalCtrl: ModalController,
		private stakeholderService: GoalStakeholderService,
		private user: UserService
	) {
		super(location, modalCtrl)
		this.form.valueChanges.pipe(
			debounceTime(2000)
		).subscribe(_ => {
			if (!this.user.uid) return
			
			this.stakeholderService.upsert({
				uid: this.user.uid,
				focus: this.form.getFocus()
			}, { params: { goalId: this.goalId }})

			this.form.markAsPristine()
			this.cdr.markForCheck()
		})
	}

}