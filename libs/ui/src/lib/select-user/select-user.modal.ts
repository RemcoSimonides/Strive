import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { AlgoliaService } from '@strive/utils/services/algolia.service'

@Component({
  selector: 'strive-select-user',
  templateUrl: './select-user.modal.html',
  styleUrls: ['./select-user.modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectUserModalComponent {

  constructor(
    public algolia: AlgoliaService,
    private modalCtrl: ModalController
  ) {
    this.search('')
  }

  search(event: any) {
    const query = typeof event === 'string' ? event : event.target.value
    this.algolia.searchProfiles(query, 1000)
  }

  select(uid: string) {
    this.modalCtrl.dismiss(uid)
  }
}