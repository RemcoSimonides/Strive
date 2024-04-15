import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Location } from '@angular/common'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular/standalone'

import { orderBy } from 'firebase/firestore'
import { of, switchMap } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'
import { WheelOfLifeEntryService } from '../../wheel-of-life.service'

import { WheelOfLifeEntry } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'


@Component({
  selector: 'strive-exercise-wheel-of-life-entry-modal',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntryModalComponent extends ModalDirective {

  @Input() showResults = false
  @Input() previousEntry: WheelOfLifeEntry<number> | undefined

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => this.service.decrypt(entries))
  )

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private router: Router,
    private service: WheelOfLifeEntryService
  ) {
    super(location, modalCtrl)
  }

  async createGoal() {
    this.dismiss()

    const modal = await this.modalCtrl.create({
      component: GoalCreateModalComponent
    })
    modal.onDidDismiss().then((data) => {
      const navToGoal = data.data?.['navToGoal']
      if (navToGoal) this.router.navigate(['/goal', navToGoal])
    })
    modal.present()
  }
}
