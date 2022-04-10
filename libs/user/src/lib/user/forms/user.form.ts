import { FormControl, Validators } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form'
import { createUserLink, createUser, User, UserLink } from "../+state/user.firestore";

function createUserFormControl(params: User) {
  const user = createUser(params)
  return {
    uid: new FormControl(user.uid),
    username: new FormControl(user.username, [Validators.required, Validators.maxLength(16)]),
    photoURL: new FormControl(user.photoURL),
  }
}

export type UserFormControl = ReturnType<typeof createUserFormControl>

export class UserForm extends FormEntity<UserFormControl> {
  constructor(user?: User) {
    super(createUserFormControl(user))
  }

  get uid() { return this.get('uid') }
  get username() { return this.get('username') }
  get photoURL() { return this.get('photoURL') }
}

function createUserLinkFormControl(params: UserLink) {
  const userLink = createUserLink(params)
  return {
    uid: new FormControl(userLink.uid),
    username: new FormControl(userLink.username),
    photoURL: new FormControl(userLink.photoURL)
  }
}

export type UserLinkFormControl = ReturnType<typeof createUserLinkFormControl>

export class UserLinkForm extends FormEntity<UserLinkFormControl> {
  constructor(userLink: UserLink) {
    super(createUserLinkFormControl(userLink))
  }

  get uid() { return this.get('uid') }
  get username() { return this.get('username') }
  get photoURL() { return this.get('photoURL') }
}