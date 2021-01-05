import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
// Ionic
import { NavParams, LoadingController, Platform, AlertController, ModalController, NavController } from '@ionic/angular';

// Rxjs
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { FcmService } from 'apps/journal/src/app/services/fcm/fcm.service';
import { TemplateService } from 'apps/journal/src/app/services/template/template.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service'
import { RoadmapService } from 'apps/journal/src/app/services/roadmap/roadmap.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';

// Interfaces
import { ITemplate } from '@strive/interfaces';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.page.html',
  styleUrls: ['./auth-modal.page.scss'],
})
export class AuthModalPage implements OnInit {

  private _backBtnSubscription: Subscription

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off-outline';

  hideShowPassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
      this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
  }

  public loginForm: FormGroup
  public signupForm: FormGroup
  public resetPasswordForm: FormGroup
  public enumAuthSegment = enumAuthSegment
  public authSegmentChoice: enumAuthSegment = enumAuthSegment.login

  validation_messages = {
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
    private _collectiveGoalService: CollectiveGoalService,
    private _db: FirestoreService,
    private fcmService: FcmService,
    private formBuilder: FormBuilder,
    private _goalService: GoalService,
    private _goalStakeholderService: GoalStakeholderService,
    private loadingCtrl: LoadingController,
    private _modalCtrl: ModalController,
    private navParams: NavParams,
    private _navCtrl: NavController,
    public _platform: Platform,
    private _roadmapService: RoadmapService,
    private _router: Router,
    private _templateService: TemplateService,
    private user: UserService
  ) { }

  ngOnInit() {

    // Initialising login form
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])]
    })

    // Initialising signup form
    this.signupForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        Validators.required
      ])],
      username: ['', Validators.compose([
        Validators.maxLength(50),
        Validators.minLength(2),
        Validators.pattern('^[0-9a-zA-Z ]+$'),
        Validators.required
      ])],
      password: ['', Validators.compose([
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9 !@#\$%\^&\*]+$'),
        Validators.required
      ])],
      // dateofbirth: ['', Validators.compose([
      //   Validators.required
      // ])]
    })

    this.resetPasswordForm = this.formBuilder.group({
      email: ['',
      Validators.compose([Validators.required])]
    })

    const segmentChoice = this.navParams.data.authSegment
    if (segmentChoice) {
      switch (segmentChoice) {
        case enumAuthSegment.login:
          this.authSegmentChoice = enumAuthSegment.login
          break
        case enumAuthSegment.register:
          this.authSegmentChoice = enumAuthSegment.register
          break
        case enumAuthSegment.forgot_password:
          this.authSegmentChoice = enumAuthSegment.forgot_password
          break
      }
    } else {
      this.authSegmentChoice = enumAuthSegment.login
    }
  }

  ionViewDidEnter() {
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription = this._platform.backButton.subscribe(() => { 
        
        if (this.authSegmentChoice === enumAuthSegment.forgot_password) {
          this.segmentChanged(enumAuthSegment.login)
        }

        if (this.authSegmentChoice === enumAuthSegment.terms || this.authSegmentChoice === enumAuthSegment.privacy_policy) {
          this.segmentChanged(enumAuthSegment.register)
        }

      });
    }
  }

  ionViewWillLeave() { 
    if (this._platform.is('android') || this._platform.is('ios')) {
      this._backBtnSubscription.unsubscribe();
    }
  }

  public async segmentChanged(segment: enumAuthSegment): Promise<void> {

    this.authSegmentChoice = segment
    switch (this.authSegmentChoice) {
      case enumAuthSegment.login:
        break
      case enumAuthSegment.register:
        break
      case enumAuthSegment.forgot_password:
        break
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

  async closeAuthModal(): Promise<void> {
    await this._modalCtrl.dismiss()
  }

  async loginUser(): Promise<void> {

    if (!this.loginForm.valid) {
      console.log(`Form is not valid yet, current value: ${this.loginForm.value}`)
    } else {
      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Logging you in...'
      })
      await loading.present()

      const email: string = this.loginForm.value.email
      const password: string = this.loginForm.value.password

      try {

        await this.afAuth.signInWithEmailAndPassword(email, password)
        await loading.dismiss()
        await this.fcmService.registerFCM()
        await this._modalCtrl.dismiss()

      } catch (error) {

        await loading.dismiss()

        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        })

        await alert.present()

      }
    }
  }

  async signUpUser(): Promise<void> {
    if (!this.signupForm.valid) {
    } else {
      const loading = await this.loadingCtrl.create()
      await loading.present()

      try {

        const { user } = await this.afAuth.createUserWithEmailAndPassword(this.signupForm.value.email, this.signupForm.value.password)

        const newUserProfile = <Profile>{
          username: this.signupForm.value.username,
          image: `assets/img/avatar/blank-profile-picture_512_thumb.png`,
          numberOfSpectating: 0,
          numberOfSpectators: 0
        }

        await this.user.createUser(user.uid, this.signupForm.value.email)
        await this.user.upsertProfile(newUserProfile)

        // create tutorial goal
        const collectiveGoalId: string = `XGtfe77pCKh1QneOipI7`
        const templateId: string = `ScA150CYoGsk4xQDcVYM`
        const template: ITemplate = await this._templateService.getTemplate(collectiveGoalId, templateId)
        const collectiveGoal: ICollectiveGoal = await this._collectiveGoalService.getCollectiveGoal(collectiveGoalId)

        if (!template || !template.createdAt || !collectiveGoal || collectiveGoal.createdAt) {

          await loading.dismiss()
          this.fcmService.registerFCM()
          this._modalCtrl.dismiss()
          return

        }

        const goalId = await this._goalService.handleCreatingGoal(this.user.uid, {
          title: template.goalTitle,
          description: template.description,
          publicity: 'private',
          deadline: template.goalDeadline,
          shortDescription: template.goalShortDescription || '',
          image: template.goalImage
        }, {
          id: collectiveGoalId,
          title: collectiveGoal.title,
          isPublic: collectiveGoal.isPublic,
          image: collectiveGoal.image
        })

        this._goalStakeholderService.upsert(user.uid, goalId, {
          isAdmin: true,
          isAchiever: true,
        })

        this._db.docWithId$<GoalStakeholder>(`Goals/${goalId}/GStakeholders/${user.uid}`)
          .pipe(take(2))
          .subscribe(async stakeholder => {

            if (stakeholder) {
              if (stakeholder.isAdmin) {

                // generate milestones
                this._roadmapService.duplicateMilestones(goalId, template.milestoneTemplateObject)

                await loading.dismiss()

                this._templateService.increaseTimesUsed(collectiveGoalId, templateId, template.numberOfTimesUsed)
                await this.fcmService.registerFCM()

                this._navCtrl.navigateRoot(`/goal/${goalId}`)
              }
            }

          })

      } catch (error) {

        await loading.dismiss()
        let alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        })
        await alert.present()

      }
    }
  }

  async resetPassword(): Promise<void> {

    if (!this.resetPasswordForm.valid) {
      console.log(`Form is not valid yet, current value: ${this.resetPasswordForm.value}`)
    } else { 
      const loading = await this.loadingCtrl.create()
      await loading.present()

      const email = this.resetPasswordForm.value.email

      try {
        await this.afAuth.sendPasswordResetEmail(email)
        await loading.dismiss()
        const alert =  await this.alertCtrl.create({
          message: 'Check your inbox for a password reset link',
          buttons: [
            { text: 'Cancel', role: 'cancel'},
            { text: 'Ok', handler: data => {
              this.segmentChanged(enumAuthSegment.login)
            }}
          ]
        })
        await alert.present()
      } catch (error) {
        await loading.dismiss()
        const alert = await this.alertCtrl.create({
          message: error.message,
          buttons: [{ text: 'Ok', role: 'cancel' }]
        })
        await alert.present()
      }
    }

  }

}

export enum enumAuthSegment {
  login,
  register,
  forgot_password,
  terms,
  privacy_policy
}
