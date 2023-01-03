import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'

import { orderBy } from 'firebase/firestore'
import { firstValueFrom, map, of, switchMap } from 'rxjs'

import { EntryModalComponent } from '@strive/exercises/wheel-of-life/modals/entry/entry.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UpsertGoalModalComponent } from '@strive/goal/modals/upsert/upsert.component'
import { Interval } from '@strive/model'

import { AuthService } from '@strive/user/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { WheelOfLifeEntryService, WheelOfLifeService } from '@strive/exercises/wheel-of-life/wheel-of-life.service'
import { getPreviousEntry } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'


@Component({
  selector: 'journal-wheel-of-life',
  templateUrl: './wheel-of-life.component.html',
  styleUrls: ['./wheel-of-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelOfLifeComponent implements OnDestroy {
  uid$ = this.auth.uid$

  isMobile$ = this.screensize.isMobile$

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => entries.length ? this.service.decrypt(entries) : of([])),
  )
  hasEntries$ = firstValueFrom(this.entries$).then(entries => !!entries.length)

  finishedLoading$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.wheelOfLifeSettingsService.getSettings(profile.uid) : of(undefined)),
    map(settings => {
      const interval: Interval = settings?.interval ? settings.interval : 'never'
      this.form.patchValue(interval, { emitEvent: false })
      return true
    })
  )

  form = new FormControl<Interval>('never')

  private sub = this.form.valueChanges.subscribe(interval => {
    if (!this.auth.uid || !interval) return
    this.wheelOfLifeSettingsService.save(this.auth.uid, { interval })
  })

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private router: Router,
    private screensize: ScreensizeService,
    private seo: SeoService,
    private wheelOfLifeSettingsService: WheelOfLifeService,
    private service: WheelOfLifeEntryService
  ) {
    this.seo.generateTags({
      title: 'Wheel of Life - Strive Journal',
      description: 'Discover in which area in life you need improvement and track results over time'
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  async addEntry() {
    const entries = await firstValueFrom(this.entries$)
    const previousEntry = getPreviousEntry(entries)

    this.modalCtrl.create({
      component: EntryModalComponent,
      componentProps: { previousEntry }
    }).then(modal => modal.present())
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  async createGoal() {
    const modal = await this.modalCtrl.create({
      component: UpsertGoalModalComponent
    })    
    modal.onDidDismiss().then((data) => {
      const navToGoal = data.data?.['navToGoal']
      if (navToGoal) this.router.navigate(['/goal', navToGoal ])
    })
    modal.present()
  }
}