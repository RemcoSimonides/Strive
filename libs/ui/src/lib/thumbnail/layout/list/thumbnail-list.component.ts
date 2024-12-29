// Angular
import { CommonModule } from '@angular/common'
import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChildren, QueryList, ViewEncapsulation, AfterContentInit, ChangeDetectorRef, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { Subscription } from 'rxjs'

@Component({
    selector: 'strive-thumbnail-list',
    templateUrl: 'thumbnail-list.component.html',
    styleUrls: ['./thumbnail-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.ShadowDom,
    imports: [
        CommonModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class ThumbnailListComponent implements AfterContentInit, OnDestroy {
  @Input() width = 160

  @ContentChildren('thumb') thumbs?: QueryList<TemplateRef<any>>

  private sub?: Subscription

  constructor(
    public screensize: ScreensizeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterContentInit() {
    this.sub = this.thumbs?.changes.subscribe(() => this.cdr.markForCheck())
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }
}