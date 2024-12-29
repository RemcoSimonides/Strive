import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, ContentChildren, ElementRef, Input, QueryList, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core'

import { map } from 'rxjs'
import { SwiperContainer } from 'swiper/element';

import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
    selector: 'strive-mini-thumbnail-swiper',
    templateUrl: 'mini-thumbnail-swiper.component.html',
    styleUrls: ['./mini-thumbnail-swiper.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        CommonModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MiniThumbnailSwiperComponent {

  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>;
  @ContentChildren('thumb') thumbs?: QueryList<TemplateRef<any>>
  @Input() width = 60
  @Input() gap = 16

  slidesPerView$ = this.screensize.width$.pipe(map(width => {
    const maxWidth = 700
    const padding = 16
    const itemWidth = this.width + this.gap
    const gutter = padding * 2

    const space = maxWidth < width ? maxWidth : width
    const available = space - gutter + this.gap

    return Math.floor(available / itemWidth)
  }))
  isDesktop$ = this.screensize.isDesktop$

  constructor(private screensize: ScreensizeService) {}

}