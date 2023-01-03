import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core'
import { ModalController, Platform } from '@ionic/angular'
import { GoalStakeholder } from '@strive/model'
import { AuthService } from '@strive/user/auth/auth.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { debounceTime } from 'rxjs'
import { FocusForm } from '../../forms/focus.form'
import { GoalStakeholderService } from '../../stakeholder.service'

@Component({
	selector: '[stakeholder] strive-focus-modal',
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
		private auth: AuthService,
		private cdr: ChangeDetectorRef,
		protected override location: Location,
		protected override modalCtrl: ModalController,
		protected override platform: Platform,
		private stakeholderService: GoalStakeholderService
	) {
		super(location, modalCtrl, platform)
		this.form.valueChanges.pipe(
			debounceTime(2000)
		).subscribe(_ => {
			if (!this.auth.uid) return
			
			this.stakeholderService.upsert({
				uid: this.auth.uid,
				focus: this.form.getFocus()
			}, { params: { goalId: this.goalId }})

			this.form.markAsPristine()
			this.cdr.markForCheck()
		})
	}

}