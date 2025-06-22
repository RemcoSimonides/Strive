import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { Capacitor } from '@capacitor/core'

import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, ModalController, Platform } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { moonOutline, sunnyOutline, close, openOutline } from 'ionicons/icons'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { delay, isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'
import { ThemeService } from '@strive/utils/services/theme.service'
import { ImageDirective } from '@strive/media/directives/image.directive'

@Component({
    selector: 'strive-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        ImageDirective,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonList,
        IonItem,
        IonLabel
    ]
})
export class MenuComponent extends ModalDirective {
	enumAuthSegment = enumAuthSegment

	isInstallable$ = this.pwa.showInstallPromotion$
	isSafari = isSafari() && matchMedia('(display-mode: browser)').matches
	theme$ = this.themeService.theme$

	showPlayStore = Capacitor.getPlatform() === 'web' && !this.platform.platforms().includes('ios')
	showAppStore = Capacitor.getPlatform() === 'web' && !this.platform.platforms().includes('android')

	constructor(
		protected override location: Location,
		protected override modalCtrl: ModalController,
		private platform: Platform,
		private pwa: PWAService,
		private router: Router,
		private themeService: ThemeService
	) {
		super(location, modalCtrl)
		addIcons({ moonOutline, sunnyOutline, close, openOutline })
	}

	openAuthModal(authSegment: enumAuthSegment) {
		this.dismiss()
		delay(250).then(_ => {
			this.modalCtrl.create({
				component: AuthModalComponent,
				componentProps: { authSegment }
			}).then(modal => modal.present())
		})
	}

	navTo(path: string[]) {
		this.navigateTo(this.router, path)
	}

	install() {
		this.pwa.showInstallPromotion()
	}

	toggleTheme() {
    this.themeService.toggle()
  }
}
