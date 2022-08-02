import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl } from '@angular/forms'
import { GoalStakeholderRole } from '@strive/model'
import { FormEntity } from '@strive/utils/form/entity.form'

export type Roles = Record<GoalStakeholderRole, boolean>

function createRolesFormControl(params?: Roles) {
  return {
    isAchiever: new FormControl(params?.isAchiever ?? true),
    isSupporter: new FormControl(params?.isSupporter ?? true),
    isAdmin: new FormControl(params?.isAdmin ?? true)
  }
}
type RolesFormControl = ReturnType<typeof createRolesFormControl>

export class RolesForm extends FormEntity<RolesFormControl> {
  constructor(roles?: Roles) {
    super(createRolesFormControl(roles))
  }

  get isAchiever() { return this.get('isAchiever') }
  get isSupporter() { return this.get('isSupporter') }
  get isAdmin() { return this.get('isAdmin') }

  get allFalse() {
    return Object.values(this.value).some(bool => !bool)
  }
}

@Component({
  selector: 'journal-options-popover',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionsPopoverComponent {
  @Input() form: RolesForm
}