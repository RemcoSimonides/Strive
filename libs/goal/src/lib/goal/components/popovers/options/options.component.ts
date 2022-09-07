import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { GoalStakeholderRole } from '@strive/model'

export type Roles = Record<GoalStakeholderRole, boolean>

function createRolesFormControl(params?: Roles) {
  return {
    isAchiever: new FormControl<boolean>(params?.isAchiever ?? true, { nonNullable: true }),
    isSupporter: new FormControl<boolean>(params?.isSupporter ?? true, { nonNullable: true }),
    isAdmin: new FormControl<boolean>(params?.isAdmin ?? true, { nonNullable: true }),
    isSpectator: new FormControl<boolean>(params?.isSpectator ?? true, { nonNullable: true })
  }
}
type RolesFormControl = ReturnType<typeof createRolesFormControl>

export class RolesForm extends FormGroup<RolesFormControl> {

  constructor(roles?: Roles) {
    super(createRolesFormControl(roles))
  }

  get isAchiever() { return this.get('isAchiever') }
  get isSupporter() { return this.get('isSupporter') }
  get isAdmin() { return this.get('isAdmin') }
  get isSpectator() { return this.get('isSpectator') }

  get oneTrue() {
    return Object.values(this.value).filter(value => value).length === 1
  }
}

@Component({
  selector: '[form] journal-options-popover',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptionsPopoverComponent {
  @Input() form!: RolesForm
}