import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { searchOutline, notificationsOutline, settingsOutline, menuOutline } from 'ionicons/icons'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { MenuComponent } from '../menu/menu.component'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { ThemeService } from '@strive/utils/services/theme.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { NotificationService } from '@strive/notification/notification.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
    selector: 'strive-header-root',
    templateUrl: './header-root.component.html',
    styleUrls: ['./header-root.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        ImageDirective,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon
    ]
})
export class HeaderRootComponent {
  private auth = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private notification = inject(NotificationService);
  private screensize = inject(ScreensizeService);
  private themeService = inject(ThemeService);


  @Input() title?: string

  enumAuthSegment = enumAuthSegment
  unreadNotifications$ = this.notification.hasUnreadNotification$

  isLoggedIn$ = this.auth.isLoggedIn$
  isMobile$ = this.screensize.isMobile$
  lightTheme$ = this.themeService.light$

  constructor() {
    addIcons({ searchOutline, notificationsOutline, settingsOutline, menuOutline })
  }

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
