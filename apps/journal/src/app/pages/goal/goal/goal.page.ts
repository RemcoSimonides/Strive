import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, Platform, PopoverController } from '@ionic/angular';
import { AngularFireFunctions } from '@angular/fire/functions';
// Rxjs
import { Observable, of, Subscription } from 'rxjs';
// Capacitor
import { Share } from '@capacitor/share';
// Strive Components
import { DiscussionModalPage } from '@strive/discussion/components/discussion-modal/discussion-modal.component';
import { GoalOptionsPopoverPage, enumGoalOptions } from '../popovers/options/options.component';
import { AddSupportModalComponent } from '@strive/support/components/add/add.component';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { GoalSharePopoverPage } from '../popovers/share/share.component';
// Strive Services
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { InviteTokenService } from '@strive/utils/services/invite-token.service';
// Strive Interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'journal-goal',
  templateUrl: 'goal.page.html',
  styleUrls: ['./goal.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalPage implements OnInit, OnDestroy {

  private goalId: string
  
  public goal$: Observable<Goal>
  public collectiveGoal$: Observable<CollectiveGoal | undefined>

  public stakeholders$: Observable<GoalStakeholder[]>
  public stakeholder$: Observable<GoalStakeholder>

  public isAdmin = false
  public isAchiever = false
  public hasOpenRequestToJoin = false

  private sub: Subscription

  constructor(
    private alertCtrl: AlertController,
    private functions: AngularFireFunctions,
    private goalService: GoalService,
    private collectiveGoalService: CollectiveGoalService,
    private inviteTokenService: InviteTokenService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private stakeholder: GoalStakeholderService,
    public user: UserService
  ) { }

  ngOnInit() { 
    this.goalId = this.route.snapshot.paramMap.get('id')
    this.goal$ = this.goalService.valueChanges(this.goalId)
    this.stakeholders$ = this.stakeholder.valueChanges({ goalId: this.goalId })

    this.collectiveGoal$ = this.goal$.pipe(
      switchMap(goal => goal.collectiveGoalId ? this.collectiveGoalService.valueChanges(goal.collectiveGoalId) : of(undefined))
    )
    
    this.sub = this.user.profile$.pipe(
      switchMap(profile => {
        if (!!profile) {
          return this.stakeholder.valueChanges(this.user.uid, { goalId: this.goalId })
        } else {
          return of(createGoalStakeholder())
        }
      })
    ).subscribe(stakeholder => {
      this.isAdmin = stakeholder?.isAdmin ?? false
      this.isAchiever = stakeholder?.isAchiever ?? false
      this.hasOpenRequestToJoin = stakeholder?.hasOpenRequestToJoin ?? false
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  public openDiscussion() {
    this.modalCtrl.create({
      component: DiscussionModalPage,
      componentProps: {
        discussionId: this.goalId
      }
    }).then(modal => modal.present())
  }

  public async presentGoalOptionsPopover(ev: UIEvent, goal: Goal) {
    const popover = await this.popoverCtrl.create({
      component: GoalOptionsPopoverPage,
      event: ev,
      componentProps: {
        isAdmin: this.isAdmin,
        isFinished: goal.isFinished
      }
    })
    await popover.present()
    await popover.onDidDismiss().then((data) => {
      switch (data.data) {
        case enumGoalOptions.editNotificationSettings:
          console.log('not supported yet')
          break
        case enumGoalOptions.duplicateGoal:
          this.duplicateGoal()
          break
        case enumGoalOptions.finishGoal:
          this.finishGoal(goal)
          break
        case enumGoalOptions.editGoal:
          this.editGoal(goal)
          break
        case enumGoalOptions.deleteGoal:
          this.deleteGoal()
      }
    })
  }

  public async duplicateGoal() {
    const loading = await this.loadingCtrl.create({
      message: `Duplicating goal`,
      spinner: 'lines'
    })
    loading.present()

    const duplicateGoalFn = this.functions.httpsCallable('duplicateGoal');
    const { error, result } = await duplicateGoalFn({ goalId: this.goalId }).toPromise();

    if (!!error) {
      loading.dismiss();
      throw new Error(result)
    };
    this.navCtrl.navigateRoot(`goal/${result}`);
    loading.dismiss();
  }

  private finishGoal(goal: Goal) {
    this.alertCtrl.create({
      header: `Awesomeness! One step closer to whatever you want to achieve in life :)`,
      subHeader: `To prevent mistakes, I have to ask whether you are sure the goal is finished. Is it?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.goalService.finishGoal(this.goalId)
            this.startPostCreation(goal)
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  private startPostCreation(goal: Goal) {
    this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        goal: goal,
        postId: goal.id
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
            await this.navCtrl.navigateRoot(`/explore`)
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
  
  public supportGoal() {
    this.modalCtrl.create({
      component: AddSupportModalComponent,
      componentProps: {
        goalId: this.goalId
      }
    }).then(modal => modal.present())
  }

  public requestToJoinGoal() {
    return this.stakeholder.upsert({
      uid: this.user.uid,
      isSpectator: true,
      hasOpenRequestToJoin: true
    }, { params: { goalId: this.goalId }})
  }

  public async openSharePopover(ev: UIEvent, goal: Goal) {

    if (this.platform.is('android') || this.platform.is('ios')) {

      const isPublic: boolean = goal.publicity === 'public' ? true : false
      const ref = await this.inviteTokenService.getShareLink(this.goalId, false, isPublic, this.isAdmin)

      await Share.share({
        title: goal.title,
        text: 'Check out this goal',
        url: ref,
        dialogTitle: 'Together we achieve!'
      });

    } else {
      this.popoverCtrl.create({
        component: GoalSharePopoverPage,
        event: ev,
        componentProps: {
          goal: goal,
          isAdmin: this.isAdmin
        }
      }).then(popover => popover.present())
    }
  }

  public saveDescription(description: string) {
    return this.goalService.updateDescription(this.goalId, description)
  }

  public async toggleAdmin(stakeholder: GoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()
    this.alertCtrl.create({
      subHeader: `Are you sure you want to make ${stakeholder.username} an admin?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.stakeholder.upsert({
              uid: stakeholder.uid,
              isAdmin: !stakeholder.isAdmin
            }, { params: { goalId: this.goalId }})
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  public toggleAchiever(stakeholder: GoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()
    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isAchiever: !stakeholder.isAchiever
    }, { params: { goalId: this.goalId }})
  }

  public toggleSupporter(stakeholder: GoalStakeholder, event: Event) {
    event.preventDefault()
    event.stopPropagation()
    return this.stakeholder.upsert({
      uid: stakeholder.uid,
      isSupporter: !stakeholder.isSupporter
    }, { params: { goalId: this.goalId }})
  }
}