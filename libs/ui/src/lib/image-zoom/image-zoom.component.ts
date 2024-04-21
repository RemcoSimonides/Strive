import { CommonModule } from '@angular/common'
import { AfterViewInit, ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core'

import { createAnimation } from '@ionic/core'

import { Media } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { MediaPipeModule } from '@strive/media/pipes/media.pipe'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderComponent } from '../header/header.component'
import { SwiperContainer } from 'swiper/element'

export function getEnterAnimation(baseEl: HTMLElement) {
	const root = baseEl.shadowRoot
	if (!root) return createAnimation()

	const modalWrapper = root.querySelector('.modal-wrapper')
	const ionBackdrop = root.querySelector('ion-backdrop')
	if (!modalWrapper || !ionBackdrop) return createAnimation()

	const wrapper = createAnimation()
	.addElement(modalWrapper)
	.fromTo('transform', 'translateX(100%)', 'translateX(0)')
	.fromTo('opacity', '0.01', '1')

	const backdrop = createAnimation()
		.addElement(ionBackdrop)
		.fromTo('opacity', '0.01', 'var(--backdrop-opacity)')

	return createAnimation()
		.addElement(baseEl)
		.easing('cubic-bezier(0.3,0,0.66,1)')
		.duration(300)
		.addAnimation([backdrop, wrapper])
}

export function getLeaveAnimation(baseEl: HTMLElement) {
	return getEnterAnimation(baseEl).direction('reverse')
}

@Component({
	standalone: true,
	selector: 'strive-image-zoom',
	templateUrl: './image-zoom.component.html',
	styleUrls: ['./image-zoom.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
	imports: [
		CommonModule,
		ImageDirective,
		MediaPipeModule,
		HeaderComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageZoomModalComponent extends ModalDirective implements AfterViewInit {

	@Input() medias: Media[] = []
	@Input() index?: number
	@Input() asset = ''

  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>

	ngAfterViewInit() {
		if (this.index && this.swiper) {
			const swiper = this.swiper.nativeElement.swiper
			swiper.slideTo(this.index)
		}
	}
}