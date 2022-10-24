import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'

import { AuthService } from '@strive/user/auth/auth.service'
import { WheelOfLifeEntryService } from '../../wheel-of-life.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { limit, orderBy } from 'firebase/firestore'
import { of, switchMap } from 'rxjs'

@Component({
  selector: 'exercise-wheel-of-life-entry-modal',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryModalComponent extends ModalDirective {

  entry$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.load([orderBy('createdAt', 'desc'), limit(1)], { uid: profile.uid }) : of([])),
    switchMap(entries => this.service.decrypt(entries))
  )

  constructor(
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private service: WheelOfLifeEntryService
  ) {
    super(location, modalCtrl)
  }

}