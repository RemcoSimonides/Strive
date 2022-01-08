import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PopoverController, Platform, NavController, ModalController } from '@ionic/angular';
// Services
import { UserSpectateService } from '@strive/user/spectator/+state/spectator.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { SeoService } from '@strive/utils/services/seo.service';
// Rxjs
import { Observable, of, Subscription } from 'rxjs';
// Modals / Popover
import { EditProfileImagePopoverComponent } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'
import { ProfileOptionsComponent } from './popovers/profile-options/profile-options.page';
import { AffirmationUpsertComponent } from '@strive/exercises/affirmation/components/upsert/upsert.component';
import { DailyGratefulnessUpsertComponent } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.component';
import { AssessLifeUpsertComponent } from '@strive/exercises/assess-life/components/upsert/upsert.component';
import { DearFutureSelfUpsertComponent } from '@strive/exercises/dear-future-self/components/upsert/upsert.component';
import { FollowingComponent } from '@strive/user/spectator/components/following/following.component';
import { FollowersComponent } from '@strive/user/spectator/components/followers/followers.component';
// Interfaces
import { createSpectator, Spectator } from '@strive/user/spectator/+state/spectator.firestore';
import { User } from '@strive/user/user/+state/user.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
// Other
import { AuthModalModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { UserForm } from '@strive/user/user/forms/user.form';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { enumExercises, exercises } from '@strive/exercises/utils';
import { GoalOptionsComponent } from './popovers/goal-options/goal-options.component';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';

@Component({
  selector: 'journal-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfileComponent implements OnInit {

  private backBtnSubscription: Subscription

  enumExercises = enumExercises
  exercises = exercises

  isOwner$: Observable<boolean>

  public isSpectator = false
  public isSpectator$: Observable<boolean>

  public profileId: string
  public profile$: Observable<User>
  public profileForm = new UserForm()

  public achievingGoals$: Observable<{ goal: Goal, stakeholder: GoalStakeholder}[]>
  public supportingGoals$: Observable<Goal[]>

  public spectators: Spectator[]
  public spectating: Spectator[]

  public segmentChoice = 'info'

  constructor(
    public user: UserService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private location: Location,
    private seo: SeoService,
    private userSpectateService: UserSpectateService,
    public screensize: ScreensizeService
  ) { }

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id')
    this.profileForm.disable();

    this.isOwner$ = this.user.user$.pipe(
      tap(user => {
        if (!this.profileId && user) {
          this.location.replaceState(`/profile/${user.uid}`)
        }
      }),
      map(user => user?.uid === this.profileId),
      startWith(false),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true }),
    )

    this.isSpectator$ = this.user.user$.pipe(
      switchMap(user => user ? this.userSpectateService.valueChanges(user.uid, { uid: this.profileId }) : of(createSpectator())),
      map(spectator => spectator?.isSpectator ?? false)
    )

    if (this.profileId) {
      this.profile$ = this.user.valueChanges(this.profileId).pipe(
        tap(profile => {
          if (profile) {
            this.seo.generateTags({ title: `${profile.username} - Strive Journal` })
            this.profileForm.patchValue(profile)
          }
        })
      )

      this.achievingGoals$ = this.isOwner$.pipe(
        distinctUntilChanged(),
        switchMap(isOwner => this.goalService.getStakeholderGoals(this.profileId, enumGoalStakeholder.achiever, !isOwner)),
      )
      this.supportingGoals$ = this.isOwner$.pipe(
        distinctUntilChanged(),
        switchMap(isOwner => this.goalService.getStakeholderGoals(this.profileId, enumGoalStakeholder.supporter, !isOwner)),
        map(values => values.map(value => value.goal))
      )
    }
  }

  ionViewDidEnter() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription = this.platform.backButton.subscribe(() => { 
        this.navCtrl.back()
      });
    }
  }
    
  ionViewWillLeave() { 
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.backBtnSubscription.unsubscribe();
    }
  } 

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  presentProfileOptionsPopover(ev: UIEvent) {
    this.popoverCtrl.create({
      component: ProfileOptionsComponent,
      event: ev
    }).then(popover => popover.present())
  }

  createGoal() {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent
    }).then(modal => modal.present())
  }

  openGoalOptions(goal: Goal, stakeholder: GoalStakeholder, ev: UIEvent) {
    ev.stopPropagation()
    ev.preventDefault()

    this.popoverCtrl.create({
      component: GoalOptionsComponent,
      componentProps: { goal, stakeholder },
      event: ev
    }).then(popover => popover.present())
  }

  async editProfileImage(user: User, ev: UIEvent): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: EditProfileImagePopoverComponent,
      componentProps: { storagePath: user.photoURL },
      event: ev
    })
    popover.onDidDismiss().then((imageURL => {
      if (imageURL && imageURL.data) {
        this.profileForm.photoURL.setValue(imageURL.data.toString())
      }
    }))
    popover.present()
  }

  updateUsername(){
    if (this.profileForm.enabled && this.profileForm.valid) {
      const username = this.profileForm.username.value as string
      if (!username) return
  
      this.user.upsert({ username, uid: this.user.uid })
    }

    this.profileForm.disabled ? this.profileForm.enable() : this.profileForm.disable()
  }

  toggleSpectate(spectate) {
    if (this.user.uid) {
      this.userSpectateService.toggleSpectate(this.profileId, spectate)
    } else {
      this.openAuthModal()
    }
  }

  openExercise(enumExercise: enumExercises) {
    let component
    switch (enumExercise) {
      case enumExercises.affirmations:
        component = AffirmationUpsertComponent
        break
      
      case enumExercises.dear_future_self:
        component = DearFutureSelfUpsertComponent
        break

      case enumExercises.daily_gratefulness:
        component = DailyGratefulnessUpsertComponent
        break

      case enumExercises.assess_life:
        component = AssessLifeUpsertComponent
        break
    }

    this.modalCtrl.create({ component }).then(modal => modal.present())
  }

  openFollowers() {
    this.modalCtrl.create({ component: FollowersComponent }).then(modal => modal.present())
  }

  openFollowing() {
    this.modalCtrl.create({ component: FollowingComponent }).then(modal => modal.present())
  }
}

