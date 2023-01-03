import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { AlertController, LoadingController } from '@ionic/angular'

import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'

@Component({
  selector: 'strive-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {

  passwordType = 'password'
  passwordIcon = 'eye-off-outline'

  loginForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required]}),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required]})
  })

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private loadingCtrl: LoadingController,
    private profileService: ProfileService,
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
      if (!email || !password) return

      try {

        const { user } = await signInWithEmailAndPassword(getAuth(), email, password)
        const isAdmin = await this.auth.isStriveAdmin(user.uid)

        if (isAdmin) {
          this.router.navigate(['/a'])
        } else {
          getAuth().signOut()
          this.alertCtrl.create({
            message: 'Not a Strive Admin',
            buttons: [{ text: 'Ok' }]
          }).then(alert => alert.present())
        }

        loading.dismiss()
        // this.router.navigate(['/a/users'])

      } catch (error: any) {

        loading.dismiss()
        this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        }).then(alert => alert.present())
      }
    }
  }

  async loginWithGoogle() {
    try {
      const credentials = await signInWithPopup(getAuth(), new GoogleAuthProvider())
      const { uid } = credentials.user

      const user = await this.profileService.getValue(uid)
      if (!user) {
        getAuth().signOut()
        this.alertCtrl.create({
          message: 'Not an existing user',
          buttons: [{ text: 'Ok' }]
        }).then(alert => alert.present())
        return
      }
      
      const isAdmin = await this.auth.isStriveAdmin(user.uid)
      if (!isAdmin) {
        getAuth().signOut()
        this.alertCtrl.create({
          message: 'Not a Strive Admin',
          buttons: [{ text: 'Ok' }]
        }).then(alert => alert.present())
        return
      }

      this.router.navigate(['/a'])
  
    } catch (error: any) {
      this.alertCtrl.create({
        message: error.message,
        buttons: [{ text: 'Ok', role: 'cancel' }]
      }).then(alert => alert.present())
    }
  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text'
    this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline'
  }
}
