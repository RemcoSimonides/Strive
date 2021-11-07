// Angular
import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChildren, QueryList, ViewEncapsulation, AfterContentInit } from '@angular/core';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

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
export class ThumbnailListComponent implements AfterContentInit {

  @Input() type:'collectiveGoal' | 'goal' | 'template' | 'user'
  @Input() canCreate = false
  @Input() collectiveGoalId: string
  @Input() limitReached = false

  @Input() width = 160

  @ContentChildren('thumb') thumbs: QueryList<TemplateRef<any>>
  changes: Observable<any>

  constructor(public screensize: ScreensizeService) {}

  ngAfterContentInit() {
    this.changes = this.thumbs.changes.pipe(
      startWith(this.thumbs)
    )
  }
}