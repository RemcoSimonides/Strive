import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core'
import { StakeholderWithGoalAndEvents } from '@strive/model'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { map } from 'rxjs'

import SwiperCore, { Navigation } from 'swiper'
SwiperCore.use([Navigation])

function slidesPerView(width: number) {
  const maxWidth = 700
  const gap = 16
  const padding = 16
  const itemWidth = 60 + gap
  const gutter = padding * 2

  const space = maxWidth < width ? maxWidth : width
  const available = space - gutter + gap

  return Math.floor(available / itemWidth)
}

@Component({
  selector: 'goal-mini-thumbnail-swiper',
  templateUrl: 'mini-thumbnail-swiper.component.html',
  styleUrls: ['./mini-thumbnail-swiper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MiniThumbnailSwiperComponent {

  @Input() navigation = false
  @Input() stakeholders: StakeholderWithGoalAndEvents[] = []
  @Output() clicked = new EventEmitter<StakeholderWithGoalAndEvents>()

  slidesPerView$ = this.screensize.width$.pipe(map(slidesPerView))
  isDesktop$ = this.screensize.isDesktop$

  constructor(private screensize: ScreensizeService) {}

}