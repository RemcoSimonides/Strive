import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms'
import { createUserLink, createUser, User, UserLink } from '@strive/model'

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

  get uid() { return this.get('uid')! }
  get username() { return this.get('username')! }
  get photoURL() { return this.get('photoURL')! }
}

function createUserLinkFormControl(params: UserLink) {
  const userLink = createUserLink(params)
  return {
    uid: new FormControl(userLink.uid, { nonNullable: true }),
    username: new FormControl(userLink.username, { nonNullable: true }),
    photoURL: new FormControl(userLink.photoURL, { nonNullable: true })
  }
}

export type UserLinkFormControl = ReturnType<typeof createUserLinkFormControl>

export class UserLinkForm extends FormGroup<UserLinkFormControl> {
  constructor(userLink: UserLink) {
    super(createUserLinkFormControl(userLink))
  }

  get uid() { return this.get('uid')! }
  get username() { return this.get('username')! }
  get photoURL() { return this.get('photoURL')! }
}