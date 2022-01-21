// Angular
import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChildren, QueryList, ViewEncapsulation, AfterContentInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { Subscription } from 'rxjs';

export interface IThumbnail {
  id: string;
  title: string;
  image: string;
  isFinished: boolean;
}

@Component({
  selector: 'strive-thumbnail-list',
  templateUrl: 'thumbnail-list.component.html',
  styleUrls: ['./thumbnail-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ThumbnailListComponent implements AfterContentInit, OnDestroy {
  @Input() width = 160

  @ContentChildren('thumb') thumbs: QueryList<TemplateRef<any>>

  private sub: Subscription

  constructor(
    public screensize: ScreensizeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterContentInit() {
    this.thumbs.changes.subscribe(() => this.cdr.markForCheck())
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }
}