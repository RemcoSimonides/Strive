import { ChangeDetectionStrategy, Component } from '@angular/core'
import { AggregationService } from '@strive/utils/services/aggregation.service'

@Component({
	selector: 'strive-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {

	aggregation$ = this.aggregation.getAggregation$()

	constructor(private aggregation: AggregationService) {}
}