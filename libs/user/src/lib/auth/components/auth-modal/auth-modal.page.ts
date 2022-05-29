import { Component, HostBinding, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
// Ionic
import { NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { createPersonal, createUser } from '@strive/user/user/+state/user.firestore';
// Strive
import { SignupForm } from '@strive/user/auth/forms/signup.form'
import { SigninForm } from '@strive/user/auth/forms/signin.form';
import { ResetPasswordForm } from '@strive/user/auth/forms/reset-password.form';
import { WelcomeModalComponent } from '../welcome/welcome.modal';
import { PersonalService } from '@strive/user/user/+state/personal.service';

export enum enumAuthSegment {
  login,
  register,
  forgot_password,
  terms,
  privacy_policy
}

@Component({
  selector: 'user-auth-modal',
  templateUrl: './auth-modal.page.html',
  styleUrls: ['./auth-modal.page.scss'],
})
export class AuthModalComponent {
  private success = false;

  passwordType = 'password';
  passwordIcon = 'eye-off-outline';

  loginForm = new SigninForm()
  signupForm = new SignupForm()
  resetPasswordForm = new ResetPasswordForm()

  enumAuthSegment = enumAuthSegment
  authSegmentChoice = enumAuthSegment.login

  validation_messages = {
    'username': [
      { type: 'required', message: 'Name is required.' },
      { type: 'minlength', message: 'Name must be at least 3 characters long.' },
      { type: 'maxlength', message: 'Name cannot be more than 16 characters long.' },
      { type: 'pattern', message: 'Your name can only contain only letters and numbers.' }
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email.' },
      { type: 'validEmail', message: 'This email has already been taken.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 8 characters long.' },
      // { type: 'pattern', message: 'Password must contain small letters, capital letters and numbers' }
    ]
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    if (this.authSegmentChoice === enumAuthSegment.forgot_password) {
      window.history.pushState(null, null, window.location.href);
      this.authSegmentChoice = enumAuthSegment.login
    } else if (this.authSegmentChoice === enumAuthSegment.terms || this.authSegmentChoice === enumAuthSegment.privacy_policy) {
      window.history.pushState(null, null, window.location.href);
      this.authSegmentChoice = enumAuthSegment.register
    } else {
      this.modalCtrl.dismiss(this.success)
    }
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private afAuth: Auth,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private personal: PersonalService,
    private user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })

    const segmentChoice = this.navParams.data.authSegment
    this.authSegmentChoice = segmentChoice ? segmentChoice : enumAuthSegment.login
  }

  async loginWithGoogle() {
    try {
      const credentials = await signInWithPopup(this.afAuth, new GoogleAuthProvider())
      const { displayName, uid, email } = credentials.user;

      const user = await this.user.getValue(uid)
      if (!user) {
        const user = createUser({ username: displayName, uid })
        const personal = createPersonal({ uid, email })
        await Promise.all([
          this.user.upsert(user),
          this.personal.add(personal, { params: { uid }}),
        ])
        const top = await this.modalCtrl.getTop()
        if (top) {
          top.dismiss(true)
          this.dismiss(true)
        }
        this.modalCtrl.create({ component: WelcomeModalComponent }).then(modal => modal.present())
      } else {
        const top = await this.modalCtrl.getTop()
        if (top) this.dismiss(true)
      }
  
    } catch (error) {
      switch (error.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/popup-blocked':
          break
        default:
          this.alertCtrl.create({
            message: error,
            buttons: [{ text: 'Ok', role: 'cancel' }]
          }).then(alert => alert.present())
      }
    }
  }

  onEnter() {
    switch (this.authSegmentChoice) {
      case enumAuthSegment.login:
        this.loginUser()
        break
      case enumAuthSegment.register:
        this.signUpUser()
        break
      case enumAuthSegment.forgot_password:
        this.resetPassword()
        break
    }
  }

  dismiss(success: boolean) {
    this.success = success;
    this.location.back()
  }

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

        await signInWithEmailAndPassword(this.afAuth, email, password)
        loading.dismiss()
        this.dismiss(true)

      } catch (error) {

        let message: string;
        switch (error.code) {
          case 'auth/wrong-password':
            message = 'Wrong password'
            break

          case 'auth/user-not-found':
            message = 'User not found'
            break
        
          default:
            message = error.message
            break
        }

        loading.dismiss()
        this.alertCtrl.create({
          message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        }).then(alert => alert.present())
      }
    }
  }

  async signUpUser() {
    if (!this.signupForm.valid) return

    const loading = await this.loadingCtrl.create()
    loading.present()

    try {
      const { user } = await createUserWithEmailAndPassword(this.afAuth, this.signupForm.value.email, this.signupForm.value.password)
      const profile = createUser({ uid: user.uid, username: this.signupForm.value.username })
      const personal = createPersonal({ uid: user.uid, email: user.email })

      await Promise.all([
        this.user.add(profile),
        this.personal.add(personal, { params: { uid: user.uid }})
      ])

      this.modalCtrl.dismiss(true)
      this.dismiss(true)
      this.modalCtrl.create({ component: WelcomeModalComponent }).then(modal => modal.present())

    } catch(error) {
      this.alertCtrl.create({
        message: error.message,
        buttons: [{ text: 'Ok', role: 'cancel' }]
      }).then(alert => alert.present())
    }
    
    loading.dismiss()
  }

  async resetPassword(): Promise<void> {

    if (!this.resetPasswordForm.valid) {
      console.log(`Form is not valid yet, current value: ${this.resetPasswordForm.value}`)
    } else { 
      const loading = await this.loadingCtrl.create()
      await loading.present()

      const { email } = this.resetPasswordForm.value

      try {

        await sendPasswordResetEmail(this.afAuth, email)
        loading.dismiss()
        this.alertCtrl.create({
          message: 'Check your inbox for a password reset link',
          buttons: [
            { text: 'Cancel', role: 'cancel'},
            { text: 'Ok', handler: () => { this.authSegmentChoice = enumAuthSegment.login }}
          ]
        }).then(alert => alert.present())

      } catch (error) {
        await loading.dismiss()
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
