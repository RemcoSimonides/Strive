import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Milestone } from '@strive/milestone/+state/milestone.firestore';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';


@Component({
  selector: '[id] strive-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent implements OnInit {

  milestones$: Observable<Milestone[]>

	@Input() id: string

  constructor(
    private milestone: MilestoneService
  ) {}

	ngOnInit() {
    this.milestones$ = this.milestone.valueChanges({ goalId: this.id })
	}

}
