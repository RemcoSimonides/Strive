import { FormControl } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form'
import { createProfileLink, ProfileLink } from "../+state/user.firestore";


function createProfileLinkFormControl(params: ProfileLink) {
  const profileLink = createProfileLink(params)
  return {
    uid: new FormControl(profileLink.uid),
    username: new FormControl(profileLink.username),
    image: new FormControl(profileLink.image)
  }
}

export type ProfileLinkFormControl = ReturnType<typeof createProfileLinkFormControl>

export class ProfileLinkForm extends FormEntity<ProfileLinkFormControl> {
  constructor(profileLink: ProfileLink) {
    super(createProfileLinkFormControl(profileLink))
  }

  get uid() { return this.get('uid') }
  get username() { return this.get('username') }
  get image() { return this.get('image') }
}