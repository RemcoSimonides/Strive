import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'
import { IonContent } from '@ionic/angular/standalone'

import { orderBy } from '@angular/fire/firestore'
import { of, switchMap } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'
import { WheelOfLifeEntryService } from '../../wheel-of-life.service'

import { WheelOfLifeEntry } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { WheelOfLifeEntryComponent } from '../../components/entry/entry.component'
import { TodayEntryPipe } from '../../pipes/entry.pipe'
import { WheelOfLifeResultsComponent } from '../../components/results/results.component'


@Component({
    selector: 'strive-exercise-wheel-of-life-entry-modal',
    templateUrl: './entry.component.html',
    styleUrls: ['./entry.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        HeaderModalComponent,
        WheelOfLifeEntryComponent,
        TodayEntryPipe,
        WheelOfLifeResultsComponent,
        IonContent
    ]
})
export class EntryModalComponent extends ModalDirective {
  private auth = inject(AuthService);
  private router = inject(Router);
  private service = inject(WheelOfLifeEntryService);


  @Input() showResults = false
  @Input() previousEntry: WheelOfLifeEntry<number> | undefined

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.collectionData([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => this.service.decrypt(entries))
  )

  constructor() {
    super()
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
