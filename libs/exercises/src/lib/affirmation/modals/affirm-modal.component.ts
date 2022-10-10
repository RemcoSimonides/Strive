import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'

import { BehaviorSubject, filter, switchMap } from 'rxjs'
import { AES, enc } from 'crypto-js'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { PersonalService } from '@strive/user/personal/personal.service'

@Component({
  selector: '[affirmation] exercise-affirm-modal',
  templateUrl: './affirm-modal.component.html',
  styleUrls: ['./affirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmModalComponent extends ModalDirective {

  _affirmation$ = new BehaviorSubject<string>('')
  affirmation$ = this._affirmation$.asObservable().pipe(
    filter(affirmation => !!affirmation),
    switchMap(async affirmation => {
      const key = await this.personalService.getEncryptionKey()
      return AES.decrypt(affirmation, key).toString(enc.Utf8)
    })
  )

  @Input() set affirmation(affirmation: string) {
    this._affirmation$.next(affirmation)
  }

  constructor(
    location: Location,
    modalCtrl: ModalController,
    private personalService: PersonalService
  ) {
    super(location, modalCtrl)
  }

}