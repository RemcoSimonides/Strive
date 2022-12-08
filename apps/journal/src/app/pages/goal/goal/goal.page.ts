import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AlertController, ModalController, PopoverController, SelectCustomEvent } from '@ionic/angular'
// Sentry
import { captureException, captureMessage } from '@sentry/capacitor'
// Firebase
import { orderBy, where } from 'firebase/firestore'
import { joinWith } from 'ngfire'
// Rxjs
import { combineLatest, Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
// Capacitor
import { Share } from '@capacitor/share'
// Strive Components
import { GoalOptionsPopoverComponent, enumGoalOptions } from '../popovers/options/options.component'
import { AddSupportModalComponent } from '@strive/support/components/add/add.component'
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component'
import { GoalSharePopoverComponent } from '@strive/goal/goal/components/popovers/share/share.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
// Strive Services
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { InviteTokenService } from '@strive/utils/services/invite-token.service'
import { ProfileService } from '@strive/user/user/profile.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { SupportService } from '@strive/support/support.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

// Strive Interfaces
import { createGoal, Goal, GoalStakeholder, groupByObjective, SupportsGroupedByGoal, Milestone, StoryItem } from '@strive/model'
import { TeamModalComponent } from '@strive/goal/stakeholder/modals/team/team.modal'
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { FocusModalComponent } from '@strive/goal/stakeholder/modals/upsert-focus/upsert-focus.component'

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent {

  private _goal?: Goal
  get goal() { return this._goal ?? createGoal() }
  @Input() set goal(goal: Goal) {
    this._goal = goal
  }

  private _stakeholder!: GoalStakeholder
  get stakeholder() { return this._stakeholder }
  @Input() set stakeholder(stakeholder: GoalStakeholder) {
    this._stakeholder = stakeholder
    
    if (stakeholder.isAdmin) {
      this.openRequests$ = this.stakeholderService.valueChanges([where('hasOpenRequestToJoin', '==', true)], { goalId: stakeholder.goalId }).pipe(
        joinWith({
          profile: stakeholder => this.profileService.valueChanges(stakeholder.uid)
        }, { shouldAwait: true })
      )
    }
  }

  @Input() story: StoryItem[] = []

  milestones$?: Observable<Milestone[]>
  openRequests$?: Observable<GoalStakeholder[]>

  supports$: Observable<SupportsGroupedByGoal[]>

  @Output() segmentChange = new EventEmitter<'goal' | 'roadmap' | 'story'>()

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private milestone: MilestoneService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholderService: GoalStakeholderService,
    private support: SupportService,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    const goalId$ = this.route.params.pipe(
      map(params => params['id'] as string)
    )

    const supports$ = combineLatest([
      this.auth.profile$,
      goalId$
    ]).pipe(
      switchMap(([ profile, goalId ]) => {
        if (!profile) return of([[], []])
        return combineLatest([
          this.support.valueChanges([where('supporterId', '==', profile.uid)], { goalId }),
          this.support.valueChanges([where('recipientId', '==', profile.uid)], { goalId })
        ])
      }),
      map(([ supporter, recipient ]) => [...supporter, ...recipient ]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: () => this.goal,
        milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestone.valueChanges(milestoneId, { goalId }) : of(undefined),
        recipient: ({ recipientId }) => this.profileService.valueChanges(recipientId),
        supporter: ({ supporterId }) => this.profileService.valueChanges(supporterId)
      }, { shouldAwait: true }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.supports$ = supports$.pipe(map(groupByObjective))

    this.milestones$ = goalId$.pipe(
      switchMap(goalId => this.milestone.valueChanges([where('deletedAt', '==', null), orderBy('order', 'asc')], { goalId }).pipe(
        joinWith({
          achiever: ({ achieverId }) => achieverId ? this.profileService.valueChanges(achieverId) : undefined,
          supports: milestone => supports$.pipe(
            map(supports => supports.filter(support => support.milestoneId === milestone.id))
          )
        },{ shouldAwait: false })
      ))
    )
  }

  async presentGoalOptionsPopover(event: UIEvent, goal: Goal) {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverComponent,
      event,
      componentProps: {
        stakeholder: this.stakeholder
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumGoalOptions.openTeamModal:
          this.openTeamModal()
          break
        case enumGoalOptions.openFocusModal:
          this.openFocusModal()
          break
        case enumGoalOptions.editNotificationSettings:
          console.warn('not supported yet')
          break
        case enumGoalOptions.editGoal:
          this.editGoal(goal)
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
      }
    })
  }

  updateDescription(description: string) {
    this.goalService.update(this.goal.id, { description })
  }

  updatePrivacy($event: SelectCustomEvent, goal: Goal) {
    if (!this.stakeholder.isAdmin) return;
    const publicity = $event.detail.value
    if (publicity === goal.publicity) return
    this.goalService.update({ id: this.goal.id, publicity })
  }

  private editGoal(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent,
      componentProps: { goal }
    }).then(modal => modal.present())
  }

  private deleteGoal() {
    this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this goal?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.goalService.remove(this.goal.id)
            this.router.navigate(['/goals'])
            this.seo.generateTags({ title: `Goals - Strive Journal` })
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
  
  async supportGoal() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.supportGoal()
      })
      return modal.present()
    }

    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goalId: this.goal.id
      }
    }).then(modal => modal.present())
  }

  async spectate() {
    if (!this.auth.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.spectate()
      })
      return modal.present()
    }

    const { isSpectator } = this.stakeholder
    const goalId = this.goal.id

    return this.stakeholderService.upsert({
      uid: this.auth.uid,
      goalId,
      isSpectator: !isSpectator
    }, { params: { goalId }})
  }


  openTeamModal() {
    this.modalCtrl.create({
      component: TeamModalComponent,
      componentProps: { goalId: this.goal.id }
    }).then(modal => modal.present())
  }

  openFocusModal() {
    this.modalCtrl.create({
      component: FocusModalComponent,
      componentProps: {
        stakeholder: this.stakeholder
      }
    }).then(modal => modal.present())
  }

  async openSharePopover(ev: UIEvent, goal: Goal) {
    const isSecret = goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goal.id, isSecret, this.stakeholder.isAdmin)

    const canShare = await Share.canShare()
    if (canShare.value) {
      try {
        Share.share({
          title: goal.title,
          text: 'Check out this goal',
          url,
          dialogTitle: 'Together we achieve!'
        }).catch(err => {
          captureException(err)
        })
      } catch(err: any) {
        captureMessage(err['message'])
      }
    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverComponent,
        event: ev,
        componentProps: { url }
      }).then(popover => popover.present())
    }
  }

  saveDescription(description: string) {
    return this.goalService.updateDescription(this.goal.id, description)
  }

  isOverdue(deadline: string) {
    return new Date(deadline) < new Date()
  }

  handleRequestDecision(stakeholder: GoalStakeholder, isAccepted: boolean, $event: UIEvent) {
    $event.stopPropagation()
    this.stakeholderService.update({
      uid: stakeholder.uid,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: this.goal.id }})
  }

  navTo(uid: string) {
    this.router.navigate(['/profile/', uid])
  }

  openZoom(goal: Goal) {
    this.modalCtrl.create({
      component: ImageZoomModalComponent,
      componentProps: {
        ref: goal.image,
        asset: 'goal.png'
      },
      enterAnimation: getEnterAnimation,
      leaveAnimation: getLeaveAnimation
    }).then(modal => modal.present())
  }
}