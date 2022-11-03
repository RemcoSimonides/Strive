import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController, Platform } from '@ionic/angular'

import { AuthService } from '@strive/user/auth/auth.service'
import { WheelOfLifeEntryService } from '../../wheel-of-life.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { orderBy } from 'firebase/firestore'
import { of, switchMap } from 'rxjs'

@Component({
  selector: 'exercise-wheel-of-life-entry-modal',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryModalComponent extends ModalDirective {

  @Input() showResults = false

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => this.service.decrypt(entries))
  )

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private service: WheelOfLifeEntryService
  ) {
    super(location, modalCtrl, platform)
  }
}