import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { Observable } from 'rxjs';


@Component({
  selector: '[id] strive-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {

	stakeholders$: Observable<GoalStakeholder[]>

	@Input() id: string

  constructor(
		private goalStakeholder: GoalStakeholderService
  ) {}

	ngOnInit() {
		this.stakeholders$ = this.goalStakeholder.valueChanges({ goalId: this.id })
	}
}
