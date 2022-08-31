import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Goal } from '@strive/model'
import { GoalService } from '../../goal.service'

@Component({
	selector: '[goal] goal-description',
	templateUrl: './description.component.html',
	styleUrls: ['./description.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalDescriptionComponent {

	private _goal!: Goal
	get goal() { return this._goal }
	@Input() set goal(goal: Goal) {
		this._goal = goal
		this.description.setValue(goal.description)
	}
	@Input() isAdmin = false

	editMode = false
	description = new FormControl('', { validators: [Validators.maxLength(400)], nonNullable: true })

	constructor(private goalService: GoalService) {}

	update() {
		this.editMode = !this.editMode

		if (this.description.invalid) return
		if (this.description.value === this.goal.description) return

		this.goalService.update(this.goal.id, {
			description: this.description.value
		})
	}
}