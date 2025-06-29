import { FormControl, FormGroup, Validators } from '@angular/forms'
import { createUser, User } from '@strive/model'

function createUserFormControl(params: Partial<User> = {}) {
  const user = createUser(params)
  return {
    uid: new FormControl(user.uid),
    username: new FormControl(user.username, [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(16)
    ]),
    photoURL: new FormControl(user.photoURL, { nonNullable: true }),
  }
}

export type UserFormControl = ReturnType<typeof createUserFormControl>

export class UserForm extends FormGroup<UserFormControl> {
  constructor(user?: User) {
    super(createUserFormControl(user))
  }

  get uid() { return this.controls.uid }
  get username() { return this.controls.username }
  get photoURL() { return this.controls.photoURL }
}
