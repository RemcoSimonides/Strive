import { FormControl, Validators } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form'
import { createProfile, createProfileLink, createUser, Profile, ProfileLink, User } from "../+state/user.firestore";

function createUserFormControl(params: User) {
  const user = createUser(params)
  return {
    uid: new FormControl(user.uid),
    email: new FormControl(user.email),
    firstName: new FormControl(user.firstName),
    lastName: new FormControl(user.lastName)
  }
}

export type UserFormControl = ReturnType<typeof createUserFormControl>

export class UserForm extends FormEntity<UserFormControl> {
  constructor(user: User) {
    super(createUserFormControl(user))
  }

  get uid() { return this.get('uid') }
  get email() { return this.get('email') }
  get firstName() { return this.get('firstName') }
  get lastName() { return this.get('lastName') }
}

function createProfileFormControl(params: Profile) {
  const profile = createProfile(params)
  return {
    uid: new FormControl(profile.uid),
    username: new FormControl(profile.username, Validators.maxLength(16)),
    photoURL: new FormControl(profile.photoURL),
  }
}

export type ProfileFormControl = ReturnType<typeof createProfileFormControl>

export class ProfileForm extends FormEntity<ProfileFormControl> {
  constructor(profile?: Profile) {
    super(createProfileFormControl(profile))
  }

  get uid() { return this.get('uid') }
  get username() { return this.get('username') }
  get photoURL() { return this.get('photoURL') }
}

function createProfileLinkFormControl(params: ProfileLink) {
  const profileLink = createProfileLink(params)
  return {
    uid: new FormControl(profileLink.uid),
    username: new FormControl(profileLink.username),
    photoURL: new FormControl(profileLink.photoURL)
  }
}

export type ProfileLinkFormControl = ReturnType<typeof createProfileLinkFormControl>

export class ProfileLinkForm extends FormEntity<ProfileLinkFormControl> {
  constructor(profileLink: ProfileLink) {
    super(createProfileLinkFormControl(profileLink))
  }

  get uid() { return this.get('uid') }
  get username() { return this.get('username') }
  get photoURL() { return this.get('photoURL') }
}