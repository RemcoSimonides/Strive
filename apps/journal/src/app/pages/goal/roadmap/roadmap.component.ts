import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, PopoverController } from '@ionic/angular';

// Rxjs
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Strive Service
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service';

// Strive Components
import { AddSupportModalPage } from '../modals/add-support-modal/add-support-modal.page';
import { MilestoneOptionsPopover } from '@strive/milestone/components/options/options.component';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';

// Strive Other
import { Milestone, MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore';
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

@Component({
  selector: '[goal] journal-goal-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent implements OnInit {

  structuredMilestones: MilestonesLeveled[] = []
  stakeholder$: Observable<GoalStakeholder>

  @Input() goal: Goal

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private milestone: MilestoneService,
    private route: ActivatedRoute,
    private router: Router,
    private service: RoadmapService,
    private stakeholderService: GoalStakeholderService,
    private user: UserService
  ) { }

  async ngOnInit() {
    this.stakeholder$ = this.user.profile$.pipe(
      switchMap(profile => {
        if (!!profile) {
          return this.stakeholderService.getStakeholder$(this.user.uid, this.goal.id).pipe(
            map(stakeholder => createGoalStakeholder(stakeholder)),
          )
        } else {
          return of(createGoalStakeholder())
        }
      })
    )

    this.structuredMilestones = await this.service.getStructuredMilestones(this.goal.id)
    this.cdr.markForCheck()
  }

  updateStatus(context: Milestone, index: number[], stakeholder: GoalStakeholder, event: Event) {
    if (context.status !== 'pending' && context.status !== 'overdue') return
    if (!stakeholder.isAdmin && !stakeholder.isAchiever) return

    event.stopPropagation() //prevents roadmap from collapsing in or out :)

    const milestone = this.getMilestone(index);

    this.alertCtrl.create({
      header: 'Good job!',
      subHeader: 'Or didn\'t you?',
      buttons: [
        {
          text: 'Succeeded',
          role: 'succeeded',
          handler: () => {
            this.milestone.upsert(this.goal.id, milestone.id, { status: 'succeeded' })
            milestone.status = 'succeeded'
            this.cdr.markForCheck()
            this.startPostCreation(milestone)
          }
        },
        {
          text: 'Failed',
          role: 'succeeded',
          handler: () => {
            this.milestone.upsert(this.goal.id, milestone.id, { status: 'failed' })
            milestone.status = 'failed'
            this.cdr.markForCheck()
            this.startPostCreation(milestone)
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ]
    }).then(alert => alert.present())
  }

  updateDeadline(deadline: string, index: number[]) {
    const milestone = this.getMilestone(index)
    milestone.deadline = deadline
    this.milestone.upsert(this.goal.id, milestone.id, { deadline });
  }

  openSupportModal(event: Event, milestone: Milestone) {
    if (milestone.status !== 'pending') return
    event.stopPropagation() //prevents roadmap from collapsing in or out :)
  
    this.modalCtrl.create({
      component: AddSupportModalPage,
      componentProps: {
        goalId: this.goal.id,
        milestone
      }
    }).then(modal => modal.present())
  }

  async openOptions(event: Event, context: Milestone, index: number[]) {
    event.stopPropagation() //prevents roadmap from collapsing in or out :)
  
    // TODO lets see if we can do it without this popover
    const popover = await this.popoverCtrl.create({
      component: MilestoneOptionsPopover,
      event: event,
      componentProps: {
        goalId: this.goal.id,
        milestone: context
      }
    })
    popover.onDidDismiss().then(data => {
      if (!data.data) return
      const milestone = this.getMilestone(index)
      milestone.achiever = data.data.achiever

      this.milestone.upsert(this.goal.id, context.id, { achiever: data.data.achiever })
      this.cdr.markForCheck();
    })
    popover.present()
  }

  async editRoadmap() {
    const loading = await this.loadingCtrl.create({ spinner: 'lines' })
    await loading.present()

    await this.goalService.toggleLock(this.goal.id, true)
    await this.router.navigate(['edit'], { relativeTo: this.route })
  }

  private getMilestone(index: number[]): Milestone {
    const getDeepValue = (object: any, index: number[]) => index.reduce((result, key, i) => i === 0 ? result?.[key] : result?.submilestones?.[key], object);
    return getDeepValue(this.structuredMilestones, index);
  }

  private async startPostCreation(milestone: Milestone) {
    const modal = await this.modalCtrl.create({
      component: UpsertPostModal,
      componentProps: {
        milestone: milestone,
        goal: this.goal,
        postId: milestone.id
      }
    })
    await modal.present()
    await modal.onDidDismiss().then(data => {
      // refresh page
      // reset imageservice
    })
  }
}