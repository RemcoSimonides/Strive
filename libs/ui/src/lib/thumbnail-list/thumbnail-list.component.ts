// Angular
import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChildren, QueryList } from '@angular/core';
import { Platform } from '@ionic/angular';

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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThumbnailListComponent {

  @Input() type:'collectiveGoal' | 'goal' | 'template' | 'user'
  @Input() canCreate = false
  @Input() collectiveGoalId: string
  @Input() limitReached = false

  @ContentChildren('thumb') thumbs: QueryList<TemplateRef<any>>

  goalSlideOptions = goalSlideOptions

  constructor(public platform: Platform) {}

}

// https://swiperjs.com/api/
const goalSlideOptions = {
  spaceBetween: 20,
  width: 165,
  freeMode: true
}