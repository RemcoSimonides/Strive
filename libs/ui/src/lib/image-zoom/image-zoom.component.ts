import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { createAnimation } from '@ionic/angular';
import { ModalDirective } from '@strive/utils/directives/modal.directive';
import SwiperCore, { Zoom, SwiperOptions } from 'swiper'

SwiperCore.use([Zoom])

export function getEnterAnimation(baseEl: HTMLElement) {
	const root = baseEl.shadowRoot!;

	const wrapper = createAnimation()
	.addElement(root.querySelector('.modal-wrapper')!)
	.fromTo('transform', 'translateX(100%)', 'translateX(0)')
	.fromTo('opacity', '0.01', '1');

	const backdrop = createAnimation()
		.addElement(root.querySelector('ion-backdrop')!)
		.fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

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
	selector: 'ui-image-zoom',
	templateUrl: './image-zoom.component.html',
	styleUrls: ['./image-zoom.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageZoomModalComponent extends ModalDirective {

	@Input() ref: string = ''
	@Input() asset: string = ''

	config: SwiperOptions = {
		zoom: true
	}
}