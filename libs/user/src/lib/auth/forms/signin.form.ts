import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@strive/utils/form/entity.form';

interface SignIn {
  email: string
  password: string
}

function createSignin(params?: Partial<SignIn>): SignIn {
  return {
    email: '',
    password: '',
    ...(params || {})
  } as SignIn
}

function createSigninControls(entity: Partial<SignIn>): EntityControl<SignIn> {
  const signin = createSignin(entity);
  return {
    email: new FormControl(signin.email, [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl(signin.password, [
      Validators.required
    ]),
  }
}

type SigninControl = ReturnType<typeof createSigninControls>;

export class SigninForm extends FormEntity<SigninControl> {
  constructor(data?: SignIn) {
    super(createSigninControls(data))
  }
}
