import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// Ionic
import { LoadingController } from '@ionic/angular';
// Services
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service'
// Interfaces
import { MilestonesLeveled } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Other
import { RouterPage } from '@strive/utils/ionViewDidEnter-replacement'
import { of, Subscription } from 'rxjs';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { switchMap, tap } from 'rxjs/operators';

// Animation for Roadmap
declare const initMilestonesAnimation: Function;

@Component({
  selector: 'app-default-roadmap',
  templateUrl: './default-roadmap.component.html',
  styleUrls: ['./default-roadmap.component.scss'],
})
export class DefaultRoadmapComponent extends RouterPage implements OnInit, OnDestroy {

  // For templates:
  @Input() collectiveGoalId: string
  @Input() templateId: string

  // For goals:
  @Input() goalId: string
  goal: Goal

  // For both:
  isAdmin = false
  isAchiever = false

  origin: 'goal' | 'template'

  public structuredMilestones: MilestonesLeveled[] = []

  private sub: Subscription

  constructor(
    private collectiveGoalStakeholder: CollectiveGoalStakeholderService,
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private roadmapService: RoadmapService,
    private router: Router,
    private stakeholder: GoalStakeholderService,
    private user: UserService,
    route: ActivatedRoute,
  ) { 
    super(router, route)
  }

  ngOnInit() {
    this.origin = !!this.goalId ? 'goal' : 'template'
    
    this.sub = this.user.profile$.pipe(
      switchMap(profile => {
        if (!!profile) {
          if (this.origin === 'goal') {
            return this.stakeholder.getStakeholder$(this.user.uid, this.goalId)
          } else if (this.origin === 'template') {
            return this.collectiveGoalStakeholder.getStakeholder$(this.user.uid, this.collectiveGoalId)
          }
        } else {
          return of({ isAdmin: false, isAchiever: false })
        }
      }),
      tap(stakeholder => {
        this.isAdmin = stakeholder.isAdmin ?? false
        this.isAchiever = stakeholder.isAchiever ?? false
      })
    ).subscribe()

    this.getData()
  }

  onEnter() {
    this.getData()
  }

  onDestroy() {
    if (!!this.sub) this.sub.unsubscribe()
    super.ngOnDestroy();
  }

  async getData() {
    if (this.origin === 'goal') {
      this.goal = await this.goalService.getGoal(this.goalId);
      this.structuredMilestones = await this.roadmapService.getStructuredMilestones(this.goalId)
    } else if (this.origin === 'template') {
      this.structuredMilestones = await this.roadmapService.getStructuredMilestonesForTemplates(this.collectiveGoalId, this.templateId)
    } else throw Error('Unknown origin')

    initMilestonesAnimation()
  }

  public async editMilestones() {
    if (!this.isAdmin) return

    const loading = await this.loadingCtrl.create({ spinner: 'lines' })
    await loading.present()

    if (this.goalId) {
      // lock goal
      await this.goalService.toggleLock(this.goalId, true)
    }
    await this.router.navigateByUrl(`${this.router.url}/edit`)
  }

}
