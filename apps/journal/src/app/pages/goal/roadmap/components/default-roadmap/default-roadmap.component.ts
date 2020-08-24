import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
// Ionic
import { LoadingController } from '@ionic/angular';
// Services
import { RoadmapService } from '../../../../../services/roadmap/roadmap.service'
import { GoalService } from 'apps/journal/src/app/services/goal/goal.service';
// Interfaces
import { IMilestonesLeveled, enumMilestoneStatus } from '../../../../../interfaces/milestone.interface';
import { IGoal } from 'apps/journal/src/app/interfaces/goal.interface';
// Other
import { RouterPage } from '../../../../../shared/ionViewDidEnter-replacement';

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
  @Input() goal: IGoal
  _isGoal: boolean
  @Input() isAchiever: boolean
  // For both:
  @Input() isAdmin: boolean

  public structuredMilestones: IMilestonesLeveled[] = []
  public enumMilestoneStatus = enumMilestoneStatus

  constructor(
    private goalService: GoalService,
    private loadingCtrl: LoadingController,
    private roadmapService: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
  ) { 
    super(router, route)
  }

  async ngOnInit() {
    this._pageIsLoading = true

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
