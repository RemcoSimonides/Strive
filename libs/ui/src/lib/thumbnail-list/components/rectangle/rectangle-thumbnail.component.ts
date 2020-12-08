import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: '[type][image] rectangle-thumbnail',
  templateUrl: 'rectangle-thumbnail.component.html',
  styleUrls: ['./rectangle-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RectangleThumbnailComponent {

  @Input() type: 'collectiveGoal' | 'goal' | 'template'
  @Input() image: string
  @Input() isFinished: boolean = true

  @ContentChild('thumbTitle') title: TemplateRef<any>

  constructor(public platform: Platform) { }

}