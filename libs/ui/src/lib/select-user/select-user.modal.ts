import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { AlgoliaService } from '@strive/utils/services/algolia.service';

@Component({
  selector: 'strive-select-user',
  templateUrl: './select-user.modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectUserModal {

  constructor(
    public algolia: AlgoliaService,
    private modalCtrl: ModalController
  ) {
    this.search('')
  }

  search(query: string) {
    this.algolia.searchProfiles(query, 1000)
  }

  select(uid: string) {
    this.modalCtrl.dismiss(uid)
  }
}