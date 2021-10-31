import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@strive/utils/form/entity.form';

interface SignUp {
  email: string;
  password: string;
  username: string;
}

function createSignup(params?: Partial<SignUp>): SignUp {
  return {
    email: '',
    password: '',
    username: '',
    ...(params || {})
  } as SignUp
}

function createSignupControls(entity: Partial<SignUp>): EntityControl<SignUp> {
  const signup = createSignup(entity);
  return {
    email: new FormControl(signup.email, [
      Validators.required,
      Validators.email,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
    ]),
    password: new FormControl(signup.password, [
      Validators.required,
      // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9 !@#\$%\^&\*]+$'),
      Validators.minLength(8),
    ]),
    username: new FormControl(signup.username, [
      Validators.required,
      Validators.maxLength(16),
      Validators.minLength(2),
      Validators.pattern('^[0-9a-zA-Z ]+$')
    ])
  }
}

type SignupControl = ReturnType<typeof createSignupControls>;

export class SignupForm extends FormEntity<SignupControl> {
  constructor(data?: SignUp) {
    super(
      createSignupControls(data),
    )
  }
}
