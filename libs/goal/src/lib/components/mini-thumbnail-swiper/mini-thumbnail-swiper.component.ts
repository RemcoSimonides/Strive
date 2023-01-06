import { ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { map } from 'rxjs'

import SwiperCore, { Navigation } from 'swiper'
SwiperCore.use([Navigation])

@Component({
  selector: 'strive-mini-thumbnail-swiper',
  templateUrl: 'mini-thumbnail-swiper.component.html',
  styleUrls: ['./mini-thumbnail-swiper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MiniThumbnailSwiperComponent {

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