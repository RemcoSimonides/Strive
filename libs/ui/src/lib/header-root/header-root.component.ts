import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { UserService } from '@strive/user/user/user.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { NotificationService } from '@strive/notification/notification.service'

@Component({
  selector: '[title] strive-header-root',
  templateUrl: './header-root.component.html',
  styleUrls: ['./header-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderRootComponent {

  @Input() title: string

  enumAuthSegment = enumAuthSegment
  unreadNotifications$ = this.notification.hasUnreadNotification$

  constructor(
    private modalCtrl: ModalController,
    private notification: NotificationService,
    public screensize: ScreensizeService,
    public user: UserService
  ) { }

  openAuthModal(authSegment: enumAuthSegment) {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: { authSegment }
    }).then(modal => modal.present())
  }
}
