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
  selector: 'thumbnail-list',
  templateUrl: 'thumbnail-list.component.html',
  styleUrls: ['./thumbnail-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ThumbnailListComponent {
  @Input() width = 160

  @ContentChildren('thumb') thumbs: QueryList<TemplateRef<any>>

  constructor(public screensize: ScreensizeService) {}

}