import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { delay } from '@strive/utils/helpers'
import { StoryItem } from '@strive/model'

@Component({
  selector: '[story] journal-goal-story',
  templateUrl: 'story.component.html',
  styleUrls: ['./story.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoryComponent {
  @Input() story: StoryItem[] = []

  async refresh($event: any) {
    await delay(500)
    $event?.target.complete()
  }
}