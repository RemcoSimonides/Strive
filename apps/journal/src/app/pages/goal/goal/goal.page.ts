import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
// Firebase
import { limit, where } from 'firebase/firestore';
// Rxjs
import { Observable, of, Subscription, tap } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
// Capacitor
import { Share } from '@capacitor/share';
// Strive Components
import { DiscussionModalComponent } from '@strive/discussion/components/discussion-modal/discussion-modal.component';
import { GoalOptionsPopoverComponent, enumGoalOptions } from '../popovers/options/options.component';
import { AddSupportModalComponent } from '@strive/support/components/add/add.component';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { GoalSharePopoverComponent } from '@strive/goal/goal/components/popovers/share/share.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
// Strive Services
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { UserService } from '@strive/user/user/user.service';
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
// Strive Interfaces
import { Goal, createGoalStakeholder, GoalStakeholder } from '@strive/model'
import { TeamModalComponent } from '@strive/goal/stakeholder/modals/team/team.modal';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { getEnterAnimation, getLeaveAnimation, ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component';
import { SeoService } from '@strive/utils/services/seo.service';
import { captureException } from '@sentry/capacitor'
import { CommentService } from '@strive/discussion/comment.service';

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent implements OnDestroy {

  private goalId!: string
  
  public goal$: Observable<Goal | undefined>

  public stakeholder$: Observable<GoalStakeholder>
  public openRequests$?: Observable<GoalStakeholder[]>
  public unreadMessage$: Observable<boolean>

  public isAdmin = false
  public isAchiever = false
  public hasOpenRequestToJoin = false

  private sub: Subscription

  @Output() segmentChange = new EventEmitter<'goal' | 'roadmap' | 'story'>()

  constructor(
    private alertCtrl: AlertController,
    private commentService: CommentService,
    private goalService: GoalService,
    private inviteTokenService: InviteTokenService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholder: GoalStakeholderService,
    public user: UserService,
    private cdr: ChangeDetectorRef,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.goalId = this.route.snapshot.paramMap.get('id') as string
    this.goal$ = this.goalService.valueChanges(this.goalId)

    this.stakeholder$ = this.user.user$.pipe(
      switchMap(user => user ? this.stakeholder.valueChanges(user.uid, { goalId: this.goalId }) : of(undefined)),
      map(stakeholder => stakeholder ? stakeholder : createGoalStakeholder()),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.unreadMessage$ = this.stakeholder$.pipe(
      switchMap(stakeholder => {
        if (!stakeholder.uid) return of([])
        const query = [limit(1)]
        if (stakeholder.lastCheckedChat) query.push(where('createdAt', '>', stakeholder.lastCheckedChat))
        return this.commentService.valueChanges(query, { goalId: this.goalId })
      }),
      map(comments => !!comments.length)
    )

    this.sub = this.stakeholder$.subscribe(stakeholder => {
      this.isAdmin = stakeholder.isAdmin
      this.isAchiever = stakeholder.isAchiever
      this.hasOpenRequestToJoin = stakeholder.hasOpenRequestToJoin
      this.cdr.markForCheck()

      if (!this.openRequests$ && this.isAdmin) {
        this.openRequests$ = this.stakeholder.valueChanges([where('hasOpenRequestToJoin', '==', true)], { goalId: this.goalId })
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  openDiscussion(goal: Goal) {
    if (this.user.uid) {
      this.modalCtrl.create({
        component: DiscussionModalComponent,
        componentProps: { goal }
      }).then(modal => {
        modal.onDidDismiss().then(_ => {
          if (!this.user.uid) return
          this.stakeholder.updateLastCheckedChat(goal.id, this.user.uid)
        })
        modal.present()
      })
    } else {
      this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      }).then(modal => modal.present())
    }
  }

  async presentGoalOptionsPopover(ev: UIEvent, goal: Goal) {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverComponent,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin,
        status: goal.status
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
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

  updateStatus($event: any, goal: Goal) {
    if (!this.isAchiever) return;

    const status = $event.detail.value;
    if (status === goal.status) return
    if (status === 'finished') {
      this.alertCtrl.create({
        header: `Awesomeness! One step closer to whatever you want to achieve in life :)`,
        subHeader: `To prevent mistakes, I have to ask whether you are sure the goal is finished. Is it?`,
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              goal.status = status
              if (!this.user.uid) return
              this.stakeholder.update(this.user.uid, { status }, { params: { goalId: this.goalId }})
              this.startPostCreation(goal)
            }
          },
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              $event.target.value = goal.status;
            }
          }
        ]
      }).then(alert => alert.present())
    } else {
      goal.status = status
      if (!this.user.uid) return
      this.stakeholder.update(this.user.uid, { status }, { params: { goalId: this.goalId }})
    }

  }

  updatePrivacy($event: any, goal: Goal) {
    if (!this.isAdmin) return;
    const publicity = $event.detail.value
    if (publicity === goal.publicity) return
    this.goalService.update({ id: this.goalId, publicity })
  }

  private startPostCreation(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertPostModalComponent,
      componentProps: {
        goalId: this.goalId,
        postId: this.goalId
      }
    }).then(modal => modal.present())
  }

  private editGoal(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertGoalModalComponent,
      componentProps: {
        currentGoal: goal
      }
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
            await this.goalService.remove(this.goalId)
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
    if (!this.user.uid) {
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
        goalId: this.goalId
      }
    }).then(modal => modal.present())
  }

  getJoinText() {
    if (this.isAchiever) return 'JOINED'
    if (this.isAdmin) return 'JOIN'
    if (this.hasOpenRequestToJoin) return 'CANCEL REQUEST'
    return 'REQUEST JOIN'
  }

  async join() {
    if (!this.user.uid) {
      const modal = await this.modalCtrl.create({
        component: AuthModalComponent,
        componentProps: {
          authSegment: enumAuthSegment.login
        }
      })
      modal.onDidDismiss().then(({ data: loggedIn }) => {
        if (loggedIn) this.join()
      })
      return modal.present()
    }

    if (!this.isAchiever && !this.hasOpenRequestToJoin) {
      if (this.isAdmin) {
        return this.stakeholder.upsert({
          uid: this.user.uid,
          isAchiever: true
        }, { params: { goalId: this.goalId }})
      } else {
        return this.stakeholder.upsert({
          uid: this.user.uid,
          isSpectator: true,
          hasOpenRequestToJoin: true
        }, { params: { goalId: this.goalId }})
      }
    }

    if (this.hasOpenRequestToJoin) {
      return this.stakeholder.upsert({
        uid: this.user.uid,
        isSpectator: true,
        hasOpenRequestToJoin: false
      }, { params: { goalId: this.goalId }})
    }
    
    this.openTeamModal()
  }

  openTeamModal() {
    this.modalCtrl.create({
      component: TeamModalComponent,
      componentProps: { goalId: this.goalId }
    }).then(modal => modal.present())
  }

  async openSharePopover(ev: UIEvent, goal: Goal) {
    const isSecret = goal.publicity !== 'public'
    const url = await this.inviteTokenService.getShareLink(this.goalId, isSecret, this.isAdmin)

    const canShare = await Share.canShare()
    if (canShare.value) {
      Share.share({
        title: goal.title,
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

  saveDescription(description: string) {
    return this.goalService.updateDescription(this.goalId, description)
  }

  isOverdue(deadline: string) {
    return new Date(deadline) < new Date()
  }

  handleRequestDecision(stakeholder: GoalStakeholder, isAccepted: boolean, $event: UIEvent) {
    $event.stopPropagation()
    this.stakeholder.upsert({
      uid: stakeholder.uid,
      isAchiever: isAccepted,
      hasOpenRequestToJoin: false
    }, { params: { goalId: this.goalId }})
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