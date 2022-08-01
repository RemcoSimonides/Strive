import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { limit, where } from 'firebase/firestore';
import { map, of, switchMap } from 'rxjs';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { NotificationService } from '@strive/notification/notification.service';

@Component({
  selector: '[title] strive-header-root',
  templateUrl: './header-root.component.html',
  styleUrls: ['./header-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderRootComponent {

  enumAuthSegment = enumAuthSegment

  @Input() title: string

  unreadNotifications$ = this.user.user$.pipe(
    switchMap(user => user
      ? this.notification.valueChanges([
          where('type', '==', 'notification'),
          where('isRead', '==', false),
          limit(1)
        ], { uid: user.uid }).pipe(
          map(notifications => !!notifications.length)
        )
      : of(false)
    )
  )

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
