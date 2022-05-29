import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PopoverController, ModalController } from '@ionic/angular';
// Services
import { UserSpectateService } from '@strive/user/spectator/+state/spectator.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { SeoService } from '@strive/utils/services/seo.service';
// Rxjs
import { BehaviorSubject, Observable, of } from 'rxjs';
// Modals / Popover
import { FollowingComponent } from '@strive/user/spectator/components/following/following.component';
import { FollowersComponent } from '@strive/user/spectator/components/followers/followers.component';
import { GoalOptionsComponent } from '@strive/goal/goal/components/goal-options/goal-options.component';
// Interfaces
import { createSpectator } from '@strive/user/spectator/+state/spectator.firestore';
import { User } from '@strive/user/user/+state/user.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { enumGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
// Other
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { EditProfileImagePopoverComponent } from './popovers/edit-profile-image/edit-profile-image.component';

@Component({
  selector: 'journal-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfileComponent implements OnInit {
  private _isOwner = new BehaviorSubject<boolean>(false)
  isOwner$: Observable<boolean>

  isSpectator$: Observable<boolean>

  profileId: string
  profile$: Observable<User>

  achievingGoals$: Observable<{ goal: Goal, stakeholder: GoalStakeholder}[]>
  supportingGoals$: Observable<Goal[]>

  constructor(
    public user: UserService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private location: Location,
    private seo: SeoService,
    private userSpectateService: UserSpectateService,
    public screensize: ScreensizeService
  ) { }

  ngOnInit() {
    this.profileId = this.route.snapshot.paramMap.get('id')

    this.isOwner$ = this.user.user$.pipe(
      tap(user => {
        if (!this.profileId && user) {
          // after logging in on your profile page
          this.profileId = user.uid
          this.location.replaceState(`/profile/${user.uid}`)
          this.load()
        }
      }),
      map(user => user?.uid === this.profileId),
      startWith(false),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true }),
      tap(isOwner => this._isOwner.next(isOwner))
    )

    this.isSpectator$ = this.user.user$.pipe(
      switchMap(user => user ? this.userSpectateService.valueChanges(user.uid, { uid: this.profileId }) : of(createSpectator())),
      map(spectator => spectator?.isSpectator ?? false)
    )

    if (this.profileId) this.load()
  }

  back() {
    this.location.back()
  }

  load() {
    this.profile$ = this.user.valueChanges(this.profileId).pipe(
      tap(profile => {
        if (profile) {
          this.seo.generateTags({ title: `${profile.username} - Strive Journal` })
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

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  async editProfileImage(user: User, ev: UIEvent) {
    if (!this._isOwner.value) return
    const popover = await this.popoverCtrl.create({
      component: EditProfileImagePopoverComponent,
      componentProps: { storagePath: user.photoURL },
      event: ev
    })
    // popover.onDidDismiss().then((imageURL => {
    //   if (imageURL && imageURL.data) {
    //     this.profileForm.photoURL.setValue(imageURL.data.toString())
    //   }
    // }))
    popover.present()
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

  toggleSpectate(spectate) {
    if (this.user.uid) {
      this.userSpectateService.toggleSpectate(this.profileId, spectate)
    } else {
      this.openAuthModal()
    }
  }

  openFollowers() {
    this.modalCtrl.create({ component: FollowersComponent }).then(modal => modal.present())
  }

  openFollowing() {
    this.modalCtrl.create({ component: FollowingComponent }).then(modal => modal.present())
  }
}

