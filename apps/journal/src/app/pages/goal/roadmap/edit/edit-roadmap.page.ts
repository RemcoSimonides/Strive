import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { SeoService } from '@strive/utils/services/seo.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'journal-edit-roadmap',
  templateUrl: './edit-roadmap.page.html',
  styleUrls: ['./edit-roadmap.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditRoadmapPage implements OnInit {

  goalId: string;
  mode: 'create' | 'update'
  roadmap$: Observable<MilestoneTemplate[]>

  constructor(
    private goal: GoalService,
    private loadingCtrl: LoadingController,
    private roadmap: RoadmapService,
    private route: ActivatedRoute,
    private router: Router,
    private seo: SeoService
  ) {
    const extras = this.router.getCurrentNavigation()
    this.mode = extras?.extras.state?.mode ? 'create' : 'update'

    this.goalId = this.route.snapshot.paramMap.get('id')
    this.roadmap$ = this.goal.valueChanges(this.goalId).pipe(
      map(goal => goal.roadmapTemplate)
    )
  }

  ngOnInit() {
    const tag = this.mode === 'create' ? 'Create' : 'Edit'
    this.seo.generateTags({ title: `${tag} Roadmap - Strive Journal` })
  }

  async save(roadmapTemplate: MilestoneTemplate[]) {
    const loading = await this.loadingCtrl.create({ spinner: 'lines' })
    loading.present()

    // Save roadmap template object
    await this.goal.update(this.goalId, { roadmapTemplate })

    // Start conversion to create milestones
    await this.roadmap.startConversion(this.goalId, roadmapTemplate)

    loading.dismiss()
    const url = this.mode === 'create' ? `goal/${this.goalId}` : `goal/${this.goalId}?t=roadmap`
    this.router.navigateByUrl(url)
  }

  cancel() {
    const url = this.mode === 'create' ? `goal/${this.goalId}` : `goal/${this.goalId}?t=roadmap`
    this.router.navigateByUrl(url)
  }

}