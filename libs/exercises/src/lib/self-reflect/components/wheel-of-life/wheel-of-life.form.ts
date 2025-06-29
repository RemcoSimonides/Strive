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

  get career() { return this.controls.career }
  get development() { return this.controls.development }
  get environment() { return this.controls.environment }
  get family() { return this.controls.family }
  get friends() { return this.controls.friends }
  get fun() { return this.controls.fun }
  get health() { return this.controls.health }
  get love() { return this.controls.love }
  get money() { return this.controls.money }
  get spirituality() { return this.controls.spirituality }
}