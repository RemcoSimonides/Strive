import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { SigninForm } from '@strive/user/auth/forms/signin.form';
import { UserService } from '@strive/user/user/+state/user.service';

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
    private router: Router,
    private user: UserService
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

        const { user } = await signInWithEmailAndPassword(this.auth, email, password)
        const isAdmin = await this.user.isStriveAdmin(user.uid)

        if (isAdmin) {
          this.router.navigate(['/a/users'])
        } else {
          this.auth.signOut()
          this.alertCtrl.create({
            message: 'Not a Strive Admin',
            buttons: [{ text: 'Ok' }]
          }).then(alert => alert.present())
        }

        console.log('isAdmin: ', isAdmin)
        loading.dismiss()
        // this.router.navigate(['/a/users'])

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