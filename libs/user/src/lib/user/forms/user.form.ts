import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms'
import { createUser, User } from '@strive/model'

function createUserFormControl(params: Partial<User> = {}) {
  const user = createUser(params)
  return {
    uid: new FormControl(user.uid),
    username: new FormControl(user.username, [Validators.required, Validators.maxLength(16)]),
    photoURL: new FormControl(user.photoURL),
  }
}

export type UserFormControl = ReturnType<typeof createUserFormControl>

export class UserForm extends FormGroup<UserFormControl> {
  constructor(user?: User) {
    super(createUserFormControl(user))
  }

  get uid() { return this.get('uid') as AbstractControl<string> }
  get username() { return this.get('username') as AbstractControl<string> }
  get photoURL() { return this.get('photoURL') as AbstractControl<string> }
}
