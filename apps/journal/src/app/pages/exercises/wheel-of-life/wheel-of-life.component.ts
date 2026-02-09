import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'

import { IonContent, IonSelect, IonSelectOption, IonButton, IonIcon, IonCard, IonCardContent, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { add } from 'ionicons/icons'

import { orderBy } from 'firebase/firestore'
import { firstValueFrom, map, of, switchMap } from 'rxjs'

import { EntryModalComponent } from '@strive/exercises/wheel-of-life/modals/entry/entry.component'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { Interval } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { WheelOfLifeEntryService, WheelOfLifeService } from '@strive/exercises/wheel-of-life/wheel-of-life.service'
import { PreviousEntryPipe, TodayEntryPipe, getPreviousEntry } from '@strive/exercises/wheel-of-life/pipes/entry.pipe'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { WheelOfLifeEntryComponent } from '@strive/exercises/wheel-of-life/components/entry/entry.component'
import { WheelOfLifeResultsComponent } from '@strive/exercises/wheel-of-life/components/results/results.component'


@Component({
    selector: 'journal-wheel-of-life',
    templateUrl: './wheel-of-life.component.html',
    styleUrls: ['./wheel-of-life.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        PageLoadingComponent,
        HeaderComponent,
        WheelOfLifeEntryComponent,
        WheelOfLifeResultsComponent,
        TodayEntryPipe, PreviousEntryPipe,
        IonContent,
        IonSelect,
        IonSelectOption,
        IonButton,
        IonIcon,
        IonCard,
        IonCardContent
    ]
})
export class WheelOfLifePageComponent implements OnDestroy {
  private auth = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);
  private screensize = inject(ScreensizeService);
  private seo = inject(SeoService);
  private wheelOfLifeSettingsService = inject(WheelOfLifeService);
  private service = inject(WheelOfLifeEntryService);

  uid = this.auth.uid

  isMobile$ = this.screensize.isMobile$

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.collectionData([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
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
    const uid = this.auth.uid()
    if (!uid || !interval) return
    this.wheelOfLifeSettingsService.save(uid, { interval })
  })

  constructor() {
    this.seo.generateTags({
      title: 'Wheel of Life - Strive Journal',
      description: 'Discover in which area in life you need improvement and track results over time'
    })
    addIcons({ add })
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
      component: GoalCreateModalComponent
    })
    modal.onDidDismiss().then((data) => {
      const navToGoal = data.data?.['navToGoal']
      if (navToGoal) this.router.navigate(['/goal', navToGoal])
    })
    modal.present()
  }
}
