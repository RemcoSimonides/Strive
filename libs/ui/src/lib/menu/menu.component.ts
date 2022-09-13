import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { delay, isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'

@Component({
    selector: 'strive-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent extends ModalDirective {
    enumAuthSegment = enumAuthSegment

    isInstallable$ = this.pwa.showInstallPromotion$
    isSafari = isSafari() && matchMedia('(display-mode: browser)').matches

    constructor(
        protected override location: Location,
        protected override modalCtrl: ModalController,
        private pwa: PWAService,
        private router: Router,
    ){
        super(location, modalCtrl)
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

    goTo(url: string) {
        this.dismiss()
        delay(250).then(_ => {
          this.router.navigateByUrl(url)
        })
    }
    
    install() {
        this.pwa.showInstallPromotion()
    }
}