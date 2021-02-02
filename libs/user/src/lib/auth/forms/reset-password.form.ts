import { FormControl, Validators } from '@angular/forms';
import { EntityControl, FormEntity } from '@strive/utils/form/entity.form';

interface ResetPassword {
  email: string
}

function createResetPassword(params?: Partial<ResetPassword>): ResetPassword {
  return {
    email: '',
    ...(params || {})
  } as ResetPassword
}

function createResetPasswordControls(entity: Partial<ResetPassword>): EntityControl<ResetPassword> {
  const reset = createResetPassword(entity);
  return {
    email: new FormControl(reset.email, [
      Validators.required,
      Validators.email
    ]),
  }
}

type ResetPasswordControl = ReturnType<typeof createResetPasswordControls>;

export class ResetPasswordForm extends FormEntity<ResetPasswordControl> {
  constructor(data?: ResetPassword) {
    super(createResetPasswordControls(data))
  }
}
