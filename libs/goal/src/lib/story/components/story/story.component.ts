import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { StoryItem } from "@strive/model";

@Component({
	selector: '[story] goal-story',
	templateUrl: './story.component.html',
	styleUrls: ['./story.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {

	@Input() story: StoryItem[] = []

	trackByFn(_: number, item: StoryItem) {
		return item?.id
  }
}