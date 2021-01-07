import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// Ionic
import { LoadingController } from '@ionic/angular';
// Services
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service'
// Interfaces
import { MilestonesLeveled, enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Other
import { RouterPage } from '@strive/utils/ionViewDidEnter-replacement'
import { Subscription } from 'rxjs';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';

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
  public enumMilestoneStatus = enumMilestoneStatus

  private sub: Subscription

  constructor(
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

  async ngOnInit() {
    this.sub = this.stakeholder.getStakeholder$(this.user.uid, this.goalId).subscribe(stakeholder => {
      this.isAdmin = stakeholder.isAdmin ?? false
      this.isAchiever = stakeholder.isAchiever ?? false
    })

    this.origin = !!this.goalId ? 'goal' : 'template'

    await this.getData()
  }

  async onEnter() {
    await this.getData()
  }

  onDestroy() {
    this.sub.unsubscribe()
    super.ngOnDestroy();
  }

  async getData() {
    this.goal = await this.goalService.getGoal(this.goalId);
    if (this.origin === 'goal') {
      this.structuredMilestones = await this.roadmapService.getStructuredMilestones(this.goalId)
    } else {
      this.structuredMilestones = await this.roadmapService.getStructuredMilestonesForTemplates(this.collectiveGoalId, this.templateId)
    }

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
