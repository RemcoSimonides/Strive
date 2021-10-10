import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';

import { Observable } from 'rxjs';


@Component({
  selector: '[id] strive-team',
  templateUrl: './team.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamComponent implements OnInit {

	team$: Observable<CollectiveGoalStakeholder[]>

	@Input() id: string

  constructor(
		private team: CollectiveGoalStakeholderService
  ) {}

	ngOnInit() {
		this.team$ = this.team.valueChanges({ collectiveGoalId: this.id })
	}
}
