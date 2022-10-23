import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ModalController } from '@ionic/angular'

import { orderBy } from 'firebase/firestore'
import { map, of, switchMap } from 'rxjs'

import { EntryModalComponent } from '@strive/exercises/wheel-of-life/modals/entry/entry.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { Aspect, aspectsConfig, Interval } from '@strive/model'

import { AuthService } from '@strive/user/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { WheelOfLifeEntryService, WheelOfLifeService } from '@strive/exercises/wheel-of-life/wheel-of-life.service'


@Component({
  selector: 'journal-wheel-of-life',
  templateUrl: './wheel-of-life.component.html',
  styleUrls: ['./wheel-of-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WheelOfLifeComponent implements OnDestroy {
  uid$ = this.auth.uid$

  segmentChoice: Aspect = 'health'

  aspectsConfig = aspectsConfig
  isMobile$ = this.screensize.isMobile$

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.load([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => entries.length ? this.service.decrypt(entries) : []),
  )

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

  addEntry() {
    this.modalCtrl.create({
      component: EntryModalComponent
    }).then(modal => modal.present())
  }

  segmentChanged(ev: any) {
    this.segmentChoice = ev.detail.value
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}