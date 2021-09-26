import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { SigninForm } from '@strive/user/auth/forms/signin.form';

@Component({
  selector: 'strive-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage {

  passwordType = 'password';
  passwordIcon = 'eye-off-outline';

  loginForm = new SigninForm()

  constructor(
    private alertCtrl: AlertController,
    private auth: Auth,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  async loginUser() {

    if (!this.loginForm.valid) {
      console.log(`Form is not valid yet, current value: ${this.loginForm.value}`)
    } else {
      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Logging you in...'
      })
      await loading.present()

      const { email, password } = this.loginForm.value

      try {

        await signInWithEmailAndPassword(this.auth, email, password)
        loading.dismiss()
        this.router.navigate(['/a/users'])

      } catch (error) {

        loading.dismiss()
        this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        }).then(alert => alert.present())
      }
    }
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
  }
}
