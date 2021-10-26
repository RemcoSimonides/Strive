// Angular
import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChildren, QueryList, ViewEncapsulation } from '@angular/core';
import { ScreensizeService } from '@strive/utils/services/screensize.service';

export interface IThumbnail {
  id: string;
  title: string;
  image: string;
  isFinished: boolean;
}

@Component({
  selector: '[type] thumbnail-list',
  templateUrl: 'thumbnail-list.component.html',
  styleUrls: ['./thumbnail-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ThumbnailListComponent {

  @Input() type:'collectiveGoal' | 'goal' | 'template' | 'user'
  @Input() canCreate = false
  @Input() collectiveGoalId: string
  @Input() limitReached = false

  @ContentChildren('thumb') thumbs: QueryList<TemplateRef<any>>

  constructor(public screensize: ScreensizeService) {}

}