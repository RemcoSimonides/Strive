import { FormControl, FormGroup } from '@angular/forms'
import { WheelOfLife, createWheelOfLife } from '@strive/model'

function createWheelOfLifeFormControl(params?: Partial<WheelOfLife>) {
  const wheelOfLife = createWheelOfLife(params)

  return {
    career: new FormControl(wheelOfLife.career, { nonNullable: true }),
    development: new FormControl(wheelOfLife.development, { nonNullable: true }),
    environment: new FormControl(wheelOfLife.environment, { nonNullable: true }),
    family: new FormControl(wheelOfLife.family, { nonNullable: true }),
    friends: new FormControl(wheelOfLife.friends, { nonNullable: true }),
    fun: new FormControl(wheelOfLife.fun, { nonNullable: true }),
    health: new FormControl(wheelOfLife.health, { nonNullable: true }),
    love: new FormControl(wheelOfLife.love, { nonNullable: true }),
    money: new FormControl(wheelOfLife.money, { nonNullable: true }),
    spirituality: new FormControl(wheelOfLife.spirituality, { nonNullable: true })
  }
}

export type WheelOfLifeFormControl = ReturnType<typeof createWheelOfLifeFormControl>

export class WheelOfLifeForm extends FormGroup<WheelOfLifeFormControl> {
  constructor(timeManagement?: Partial<WheelOfLife>) {
    super(createWheelOfLifeFormControl(timeManagement))
  }

  get career() { return this.get('career')! as FormControl }
  get development() { return this.get('development')! as FormControl }
  get environment() { return this.get('environment')! as FormControl }
  get family() { return this.get('family')! as FormControl }
  get friends() { return this.get('friends')! as FormControl }
  get fun() { return this.get('fun')! as FormControl }
  get health() { return this.get('health')! as FormControl }
  get love() { return this.get('love')! as FormControl }
  get money() { return this.get('money')! as FormControl }
  get spirituality() { return this.get('spirituality')! as FormControl }
}