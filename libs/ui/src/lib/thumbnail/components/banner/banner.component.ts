import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AffirmationUpsertComponent } from "@strive/exercises/affirmation/components/upsert/upsert.component";
import { AuthModalPage } from "@strive/user/auth/components/auth-modal/auth-modal.page";
import { UserService } from "@strive/user/user/+state/user.service";

@Component({
  selector: 'strive-banner',
  templateUrl: 'banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerComponent {

  constructor(
    private modalCtrl: ModalController,
    private user: UserService
  ) {}

  openExercise() {
    const component = this.user.uid ? AffirmationUpsertComponent : AuthModalPage
    this.modalCtrl.create({ component }).then(modal => modal.present())
  }

}