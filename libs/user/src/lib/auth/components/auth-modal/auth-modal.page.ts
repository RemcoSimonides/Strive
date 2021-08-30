import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
// Ionic
import { NavParams, LoadingController, Platform, AlertController, ModalController, NavController } from '@ionic/angular';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { FcmService } from '@strive/utils/services/fcm.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { createProfile } from '@strive/user/user/+state/user.firestore';
// Strive
import { SignupForm } from '@strive/user/auth/forms/signup.form'
import { SigninForm } from '@strive/user/auth/forms/signin.form';
import { ResetPasswordForm } from '@strive/user/auth/forms/reset-password.form';
import firebase from 'firebase';

export enum enumAuthSegment {
  login,
  register,
  forgot_password,
  terms,
  privacy_policy
}

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.page.html',
  styleUrls: ['./auth-modal.page.scss'],
})
export class AuthModalPage implements OnInit {

  private backBtnSubscription: Subscription

  public passwordType = 'password';
  public passwordIcon = 'eye-off-outline';

  public loginForm = new SigninForm()
  public signupForm = new SignupForm()
  public resetPasswordForm = new ResetPasswordForm()

  public enumAuthSegment = enumAuthSegment
  public authSegmentChoice = enumAuthSegment.login

  public validation_messages = {
    'username': [
      { type: 'required', message: 'Name is required.' },
      { type: 'minlength', message: 'Name must be at least 3 characters long.' },
      { type: 'maxlength', message: 'Name cannot be more than 50 characters long.' },
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
      { type: 'pattern', message: 'Password must contain small letters, capital letters and numbers' }
    ],
    // Please ask 'How old are you' instead of date of birth
    // 'dateofbirth': [
    //   { type: 'required', message: 'Please fill in your date of birth.'}
    // ]
  }

  constructor(
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
    private fcmService: FcmService,
    private functions: AngularFireFunctions,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private navCtrl: NavController,
    public platform: Platform,
    private user: UserService
  ) { }

  ngOnInit() {
    const segmentChoice = this.navParams.data.authSegment
    this.authSegmentChoice = !!segmentChoice ? segmentChoice : enumAuthSegment.login
  }

  fixesAnIssue() {
    // TODO remove when fixed
    // https://github.com/angular/angularfire/issues/2864
    // https://github.com/firebase/firebase-js-sdk/issues/4932
    // next line doesnt get called but it does fix an issue 
    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
  }

  ionViewDidEnter() {
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => { 
        
        if (this.authSegmentChoice === enumAuthSegment.forgot_password) {
          this.authSegmentChoice = enumAuthSegment.login
        }

        if (this.authSegmentChoice === enumAuthSegment.terms || this.authSegmentChoice === enumAuthSegment.privacy_policy) {
          this.authSegmentChoice = enumAuthSegment.register
        }

      });
    }
  }

  ionViewWillLeave() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
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

  closeAuthModal() {
    this.modalCtrl.dismiss()
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

        await this.afAuth.signInWithEmailAndPassword(email, password)
        loading.dismiss()
        await this.fcmService.registerFCM()
        this.modalCtrl.dismiss()

      } catch (error) {

        loading.dismiss()
        this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        }).then(alert => alert.present())
      }
    }
  }

  async signUpUser() {
    if (!this.signupForm.valid) {
    } else {
      const loading = await this.loadingCtrl.create()
      loading.present()

      try {
        const { user } = await this.afAuth.createUserWithEmailAndPassword(this.signupForm.value.email, this.signupForm.value.password)
        const profile = createProfile({ id: user.uid, username: this.signupForm.value.username })

        await Promise.all([
          this.user.createUser(user.uid, this.signupForm.value.email),
          this.user.upsertProfile(profile, user.uid)
        ])

      } catch(error) {
        loading.dismiss()
        this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        }).then(alert => alert.present())
      }
      
      try {
        const useTemplateFn = this.functions.httpsCallable('useTemplate')
        const { error, result } = await useTemplateFn({ collectiveGoalId: 'XGtfe77pCKh1QneOipI7', templateId: 'ScA150CYoGsk4xQDcVYM' }).toPromise();

        await this.fcmService.registerFCM()
        this.modalCtrl.dismiss()

        loading.dismiss()
        if (!!error) {
          throw new Error(result)
        } else {
          this.navCtrl.navigateRoot(`/goal/${result}`)
        }

      } catch (error) {
        loading.dismiss()
        this.modalCtrl.dismiss()
      }
    }
  }

  async resetPassword(): Promise<void> {

    if (!this.resetPasswordForm.valid) {
      console.log(`Form is not valid yet, current value: ${this.resetPasswordForm.value}`)
    } else { 
      const loading = await this.loadingCtrl.create()
      await loading.present()

      const { email } = this.resetPasswordForm.value

      try {

        await this.afAuth.sendPasswordResetEmail(email)
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
