import { CommonModule, Location } from '@angular/common'
import { Component, Input, Pipe, PipeTransform } from '@angular/core'
import { IonicModule, ModalController, PopoverController } from '@ionic/angular'

import { Share } from '@capacitor/share'
import { joinWith } from 'ngfire'
import { captureException } from '@sentry/angular'
import { BehaviorSubject, combineLatest, map, Observable, of, ReplaySubject, startWith, switchMap } from 'rxjs'

// Components
import { GoalSharePopoverComponent } from '@strive/goal/popovers/share/share.component'
import { GoalSharePopoverModule } from '@strive/goal/popovers/share/share.module'

// Services
import { AuthService } from '@strive/auth/auth.service'
import { SpectatorService } from '@strive/spectator/spectator.service'
import { AlgoliaService } from '@strive/utils/services/algolia.service'
import { ProfileService } from '@strive/user/profile.service'

// Directives
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ImageModule } from '@strive/media/directives/image.module'
import { AlgoliaUser, createGoal, Goal, GoalStakeholder } from '@strive/model'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'

type MinimumProfile = {
  uid: string
  username: string
  photoURL: string
  openInvite?: boolean
  isStakeholder?: boolean
  isSpectating?: boolean
  isSpectator?: boolean
}

function profileToMinimumProfile(profiles: AlgoliaUser[]): MinimumProfile[] {
  return profiles.map(profile => ({
    uid: profile.uid,
    photoURL: profile.photoURL,
    username: profile.username
  }))
}

@Pipe({ name: 'subtitle', standalone: true })
export class SubtitlePipe implements PipeTransform {
  transform(profile: MinimumProfile) {
    if (profile.isSpectating) return 'Following'
    if (profile.isSpectator) return 'Follower'
    return ''
  }
}

@Pipe({ name: 'inviteText', standalone: true })
export class InviteTextPipe implements PipeTransform {
  transform(profile: MinimumProfile) {
    if (profile.isStakeholder) return 'Member'
    if (profile.openInvite) return 'Invited'
    return 'Invite'
  }
}

@Component({
  selector: 'journal-add-others',
  templateUrl: './add-others.component.html',
  styleUrls: ['./add-others.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    SubtitlePipe,
    InviteTextPipe,
    GoalSharePopoverModule
  ]
})
export class AddOthersModalComponent extends ModalDirective {

  private goalId$ = new ReplaySubject<string>(1)
  isLoading$ = new BehaviorSubject(true)

  private _goal = createGoal()
  get goal() { return this._goal }
  @Input() set goal(goal: Goal) {
    this._goal = goal
    this.goalId$.next(goal.id)
  }
  @Input() stakeholder?: GoalStakeholder

  spectating$: Observable<MinimumProfile[]> = this.auth.profile$.pipe(
    switchMap(user => user ? this.spectatorService.getSpectating$(user.uid) : of([])),
    joinWith({
      user: spectator => this.profileService.valueChanges(spectator.profileId)
    }, { shouldAwait: true }),
    map(spectators => spectators.map(spectator => ({
      uid: spectator.user?.uid ?? '',
      username: spectator.user?.username ?? '',
      photoURL: spectator.user?.photoURL ?? '',
      isSpectating: true
    })))
  )

  spectators$: Observable<MinimumProfile[]> = this.auth.profile$.pipe(
    switchMap(user => user ? this.spectatorService.getSpectators$(user.uid) : of([])),
    joinWith({
      user: spectator => this.profileService.valueChanges(spectator.uid)
    }, { shouldAwait: true }),
    map(spectators =>  spectators.map(spectator => ({
      uid: spectator.user?.uid ?? '',
      username: spectator.user?.username ?? '',
      photoURL: spectator.user?.photoURL ?? '',
      isSpectator: true
    })))
  )

  stakeholders$: Observable<GoalStakeholder[]> = this.goalId$.pipe(
    switchMap(goalId => this.stakeholderService.valueChanges({ goalId }))
  )

  results$ = combineLatest([
    this.spectating$,
    this.spectators$,
    this.stakeholders$,
    this.algoliaService.profiles$.pipe(map(profileToMinimumProfile), startWith([]))
  ]).pipe(
    map(([spectating, spectators, stakeholders, profiles]) => {
      const isSpectator = (profile: MinimumProfile) => spectators.some(spectator => spectator.uid === profile.uid)
      const isSpectating = (profile: MinimumProfile) => spectating.some(spectator => spectator.uid === profile.uid)
      const isStakeholder = (profile: MinimumProfile) => stakeholders
        .filter(stakeholder => stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSpectator || stakeholder.isSupporter)
        .some(stakeholder => stakeholder.uid === profile.uid)
      const hasInvite = (profile: MinimumProfile) => {
        const stakeholder = stakeholders.find(s => s.uid === profile.uid)
        return stakeholder?.hasInviteToJoin ?? false
      }

      const setRoles = (profile: MinimumProfile) => ({
        ...profile,
        isSpectating: isSpectating(profile),
        isSpectator: isSpectator(profile),
        isStakeholder: isStakeholder(profile),
        openInvite: hasInvite(profile)
      })

      this.isLoading$.next(false)

      if (this.query === '') {
        const merged = [...spectating, ...spectators].map(setRoles)
        return merged.filter((value, index) => merged.findIndex(el => el.uid === value.uid) === index)
      }

      return profiles.map(setRoles)
    })
  )

  private query = ''

  constructor(
    private auth: AuthService,
    private algoliaService: AlgoliaService,
    private stakeholderService: GoalStakeholderService,
    private inviteTokenService: InviteTokenService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private spectatorService: SpectatorService
  ) {
    super(location, modalCtrl)
  }

  search(event: any) {
    const query = typeof event === 'string' ? event : event.target.value
    this.query = query
    this.algoliaService.search(query, 1000)
  }

  invite(profile: MinimumProfile) {
    if (!this.auth.uid) return
    if (!this.goal) return
    if (!this.stakeholder?.isAdmin) return

    return this.stakeholderService.upsert({
      uid: profile.uid,
      goalId: this.goal.id,
      hasInviteToJoin: true,
    }, { params: { goalId: this.goal.id }})
  }

  async share(ev: UIEvent) {
    if (!this.goal || !this.stakeholder) return

    const isSecret = this.goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goal.id, isSecret, this.stakeholder.isAdmin)

    const canShare = await Share.canShare()
    if (canShare.value) {
      Share.share({
        title: this.goal.title,
        text: 'Check out this goal',
        url,
        dialogTitle: 'Together we achieve!'
      }).catch(err => {
        captureException(err)
      })
    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event: ev,
        componentProps: { url }
      }).then(popover => popover.present())
    }
  }
}