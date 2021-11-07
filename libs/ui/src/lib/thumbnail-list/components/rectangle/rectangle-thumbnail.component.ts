import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { ScreensizeService } from '@strive/utils/services/screensize.service';

@Component({
  selector: '[type][image] rectangle-thumbnail',
  templateUrl: 'rectangle-thumbnail.component.html',
  styleUrls: ['./rectangle-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RectangleThumbnailComponent {

  public assets = {  
    collectiveGoal: 'collective-goal.jpeg',
    goal: 'goal.jpeg',
    template: 'goal.jpeg',
    user: 'profile.png'
  }

  @Input() type: 'collectiveGoal' | 'goal' | 'template' | 'user'
  @Input() image: string
  @Input() isFinished: boolean

  @ContentChild('thumbTitle') title: TemplateRef<any>

  constructor(public screensize: ScreensizeService) { }

}