import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

@Component({
	selector: 'strive-description',
	templateUrl: './description.component.html',
	styleUrls: ['./description.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DescriptionComponent implements OnInit {

	@Output() updated = new EventEmitter<string>()

	private _value!: string
	get value() { return this._value }
	@Input() set value(value: string) {
		this._value = value
		this.description.setValue(value)
	}
	@Input() canEdit = false

	@Input() maxlength = 400

	editMode = false
	description = new FormControl('', { nonNullable: true })


	ngOnInit() {
		this.description.addValidators(Validators.maxLength(this.maxlength))
	}

	update() {
		this.editMode = !this.editMode

		if (this.description.invalid) return
		if (this.description.value === this.value) return

		this.updated.emit(this.description.value)
	}
}
