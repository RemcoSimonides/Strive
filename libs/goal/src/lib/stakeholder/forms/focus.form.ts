import { FormControl, FormGroup } from '@angular/forms'
import { createFocus, Focus } from '@strive/model'

function createFocusFormControl(params?: Partial<Focus>) {
	const focus = createFocus(params)
	return {
		on: new FormControl(focus.on, { nonNullable: true }),
		why: new FormControl(focus.why, { nonNullable: true }),
		inspiration: new FormControl(focus.inspiration, { nonNullable: true })
	}
}
  
export type FocusFormControl = ReturnType<typeof createFocusFormControl>
  
export class FocusForm extends FormGroup<FocusFormControl> {
	constructor(focus?: Partial<Focus>) {
		super(createFocusFormControl(focus))
	}

	get on() { return this.get('on')! }
	get why() { return this.get('why')! }
	get inspiration() { return this.get('inspiration')! }

	getFocus() {
		const { on, why, inspiration } = this.value
		return createFocus({ on, why, inspiration })
	}
}