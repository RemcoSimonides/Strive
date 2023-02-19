import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { ThemeService } from '@strive/utils/services/theme.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { NotificationService } from '@strive/notification/notification.service'
import { MenuComponent } from '../menu/menu.component'
import { AuthService } from '@strive/auth/auth.service'

@Component({
  selector: 'strive-header-root',
  templateUrl: './header-root.component.html',
  styleUrls: ['./header-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderRootComponent {

  @Input() title?: string

  enumAuthSegment = enumAuthSegment
  unreadNotifications$ = this.notification.hasUnreadNotification$

  isLoggedIn$ = this.auth.isLoggedIn$
  isMobile$ = this.screensize.isMobile$
  lightTheme$ = this.themeService.light$

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private notification: NotificationService,
    private screensize: ScreensizeService,
    private themeService: ThemeService
  ) { }

  openAuthModal(authSegment: enumAuthSegment) {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: { authSegment }
    }).then(modal => modal.present())
  }

  openMenu() {
    this.modalCtrl.create({
      component: MenuComponent
    }).then(modal => modal.present())
  }
}
