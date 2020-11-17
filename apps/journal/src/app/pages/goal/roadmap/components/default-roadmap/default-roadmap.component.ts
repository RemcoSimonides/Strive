import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// Ionic
import { LoadingController } from '@ionic/angular';
// Services
import { RoadmapService } from '../../../../../services/roadmap/roadmap.service'
import { GoalService } from '@strive/goal/goal/+state/goal.service'
// Interfaces
import { 
  IMilestonesLeveled,
  enumMilestoneStatus
} from '@strive/interfaces';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Other
import { RouterPage } from '../../../../../shared/ionViewDidEnter-replacement';
import { Subscription } from 'rxjs';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';

// Animation for Roadmap
declare var initMilestonesAnimation: any;

@Component({
  selector: 'app-default-roadmap',
  templateUrl: './default-roadmap.component.html',
  styleUrls: ['./default-roadmap.component.scss'],
})
export class DefaultRoadmapComponent extends RouterPage implements OnInit, OnDestroy {
  _pageIsLoading: boolean

  // For templates:
  @Input() collectiveGoalId: string
  @Input() templateId: string
  // For goals:
  @Input() goalId: string
  @Input() goal: Goal
  _isGoal: boolean
  // For both:
  isAdmin = false
  isAchiever = false

  public structuredMilestones: IMilestonesLeveled[] = []
  public enumMilestoneStatus = enumMilestoneStatus

  private sub: Subscription

  constructor(
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private stakeholder: GoalStakeholderService,
    private user: UserService
  ) { 
    super(router, route)
  }

  async ngOnInit() {
    this._pageIsLoading = true

    this.sub = this.stakeholder.getStakeholder$(this.user.uid, this.goalId).subscribe(stakeholder => {
      this.isAdmin = stakeholder.isAdmin ?? false
      this.isAchiever = stakeholder.isAchiever ?? false
    })

    if (this.goalId) this._isGoal = true
    await this.getData()

    this._pageIsLoading = false
   
  }

  async onEnter() {

    await this.getData()
    
  }

  onDestroy() {
    super.ngOnDestroy();
  }

  async getData(): Promise<void> {

    if (this._isGoal) {
      this.structuredMilestones = await this.roadmapService.getStructuredMilestones(this.goalId)
    } else {
      this.structuredMilestones = await this.roadmapService.getStructuredMilestonesForTemplates(this.collectiveGoalId, this.templateId)
    }

    initMilestonesAnimation()

  }

  public async editMilestones(): Promise<void> {
    if (!this.isAdmin) return

    const loading = await this.loadingCtrl.create({
      spinner: 'lines'
    })
    await loading.present()

    if (this.goalId) {

      // lock goal
      await this.goalService.toggleLock(this.goalId, true)

      await this.router.navigateByUrl(`${this.router.url}/edit`)

    } else if (this.templateId) {

      await this.router.navigateByUrl(`${this.router.url}/edit`)

    }
  }

}
