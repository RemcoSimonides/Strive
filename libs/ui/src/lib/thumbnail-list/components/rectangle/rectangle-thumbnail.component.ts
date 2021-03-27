import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: '[type][image] rectangle-thumbnail',
  templateUrl: 'rectangle-thumbnail.component.html',
  styleUrls: ['./rectangle-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RectangleThumbnailComponent {

  public assets = {  
    collectiveGoal: 'collective-goal.jpg',
    goal: 'goal.jpg',
    template: 'goal.jpg',
    user: 'profile.png'
  }

  @Input() type: 'collectiveGoal' | 'goal' | 'template' | 'user'
  @Input() image: string
  @Input() isFinished: boolean

  @ContentChild('thumbTitle') title: TemplateRef<any>

  constructor(public platform: Platform) { }

}