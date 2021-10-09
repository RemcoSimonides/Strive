import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: '[id] strive-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent implements OnInit {

  roadmap$: Observable<MilestoneTemplate[]>

	@Input() id: string

  constructor(
    private goal: GoalService,
    private loadingCtrl: LoadingController,
    private roadmap: RoadmapService
  ) {}

	ngOnInit() {
    this.roadmap$ = this.goal.valueChanges(this.id).pipe(
      map(goal => goal.roadmapTemplate)
    )
	}

  async save(roadmapTemplate: MilestoneTemplate[]) {
    const loading = await this.loadingCtrl.create({ spinner: 'lines' })
    loading.present()

    // Save roadmap template object
    await this.goal.update(this.id, { roadmapTemplate })

    // Start conversion to create milestones
    await this.roadmap.startConversion(this.id, roadmapTemplate)

    loading.dismiss()
  }

  cancel() {}
}
