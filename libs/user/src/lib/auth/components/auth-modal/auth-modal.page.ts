import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Location } from '@angular/common'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  User
} from 'firebase/auth'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { captureException } from '@sentry/angular'

import { NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'

import { ProfileService } from '@strive/user/user/profile.service'
import { PersonalService } from '@strive/user/personal/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

import { createPersonal, createUser } from '@strive/model'
import { createRandomString } from '@strive/utils/helpers'

import { combineLatest, map, of } from 'rxjs'

import { WelcomeModalComponent } from '../welcome/welcome.modal'

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
export class AuthModalComponent implements OnInit {
  @HostBinding() modal?: HTMLIonModalElement

  private success = false

  passwordType = 'password'
  passwordIcon = 'eye-off-outline'

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })
 
  signupForm = new FormGroup({
    email: new FormControl<string>('', [
      Validators.required,
      Validators.email,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
    ]),
    password: new FormControl<string>('', [
      Validators.required,
      // Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9 !@#\$%\^&\*]+$'),
      Validators.minLength(8),
    ]),
    username: new FormControl<string>('', [
      Validators.required,
      Validators.maxLength(16),
      Validators.minLength(2),
      Validators.pattern('^[0-9a-zA-Z ]+$')
    ])
  })

  resetPasswordForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email])
  })

  enumAuthSegment = enumAuthSegment
  @Input() authSegmentChoice = enumAuthSegment.login

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

  showIOSHeader$ = combineLatest([
    this.screensize.isMobile$,
    of(Capacitor.getPlatform() === 'ios')
  ]).pipe(
    map(([isMobile, isIOS]) => isMobile && isIOS)
  )

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    if (this.authSegmentChoice === enumAuthSegment.forgot_password) {
      window.history.pushState(null, '', window.location.href);
      this.authSegmentChoice = enumAuthSegment.login
    } else if (this.authSegmentChoice === enumAuthSegment.terms || this.authSegmentChoice === enumAuthSegment.privacy_policy) {
      window.history.pushState(null, '', window.location.href);
      this.authSegmentChoice = enumAuthSegment.register
    } else {
      this.modalCtrl.dismiss(this.success)
    }
  }

  constructor(
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private personal: PersonalService,
    private profile: ProfileService,
    private screensize: ScreensizeService
  ) {
    window.history.pushState(null, '', window.location.href)
  }

  ngOnInit() {
    this.modal?.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })

    const segmentChoice = this.navParams.data['authSegment']
    this.authSegmentChoice = segmentChoice ? segmentChoice : enumAuthSegment.login
  }

  async loginWithGoogle() {
    try {
      const gUser = await GoogleAuth.signIn()
      const gCredentials = GoogleAuthProvider.credential(gUser.authentication.idToken, gUser.authentication.accessToken)
      const credentials = await signInWithCredential(getAuth(), gCredentials)
      
      this.oAuthLogin(credentials.user)
  
    } catch (error: any) {
      captureException(error)

      let code = undefined
      if (error?.code) code = error.code
      if (error?.error) code = error.error
      
      switch (code) {
        case '12501':
        case 'popup_closed_by_user':
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

  async loginWithApple() {
    try {

      const result = await FirebaseAuthentication.signInWithApple({ skipNativeAuth: true })
      const provider = new OAuthProvider('apple.com')
      const oAuthCredentials = provider.credential({
        idToken: result.credential?.idToken,
        rawNonce: result.credential?.nonce
      })
      const credentials = await signInWithCredential(getAuth(), oAuthCredentials)
      this.oAuthLogin(credentials.user)

    } catch (error: any) {
      captureException(error)

      if (error == 'Error: The web operation was canceled by the user.') return

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
      if (!email || !password) {
        throw new Error('Email or Password not provided')
      }

      try {

        await signInWithEmailAndPassword(getAuth(), email, password)
        loading.dismiss()
        this.dismiss(true)
        this.personal.registerFCM()

      } catch (error: any) {
        captureException(error)
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
      const { email, password, username } = this.signupForm.value
      if (!email || !password || !username) {
        throw new Error('username, email or password not provided')
      }
      const { user } = await createUserWithEmailAndPassword(getAuth(), email, password)
      const profile = createUser({ uid: user.uid, username })
      const personal = createPersonal({ uid: user.uid, email, key: createRandomString(32) })

      await Promise.all([
        this.profile.add(profile),
        this.personal.add(personal, { params: { uid: user.uid }})
      ])

      this.modalCtrl.dismiss(true)
      this.dismiss(true)
      this.modalCtrl.create({ component: WelcomeModalComponent }).then(modal => modal.present())

    } catch(error: any) {
      captureException(error)
      let message: string;
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'An account with this email already exists'
          break
        default:
          message = error.message
          break
      }

      this.alertCtrl.create({
        message,
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
      if (!email) throw new Error('email not provided')

      try {

        await sendPasswordResetEmail(getAuth(), email)
        loading.dismiss()
        this.alertCtrl.create({
          message: 'Check your inbox for a password reset link',
          buttons: [
            { text: 'Cancel', role: 'cancel'},
            { text: 'Ok', handler: () => { this.authSegmentChoice = enumAuthSegment.login }}
          ]
        }).then(alert => alert.present())

      } catch (error: any) {
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

  private async oAuthLogin(user: User) {
    const { displayName, uid, email } = user

    const profile = await this.profile.getValue(uid)
    if (!profile) {
      const user = createUser({ username: displayName ?? '', uid })
      const personal = createPersonal({ uid, email: email ?? '', key: createRandomString(32) })
      await Promise.all([
        this.profile.upsert(user),
        this.personal.add(personal, { params: { uid }})
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
      this.personal.registerFCM()
    }
  }
}
