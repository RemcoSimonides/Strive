import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: '[id] strive-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {
	@Input() id: string
}
