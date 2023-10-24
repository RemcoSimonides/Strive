import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { IonicModule, PopoverController } from '@ionic/angular'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeSettingsService } from '@strive/exercises/assess-life/assess-life.service'
import { AssessLifeIntervalWithNever, createAssessLifeSettings, WeekdayWithNever } from '@strive/model'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  standalone: true,
  selector: 'journal-assess-life-settings',
  templateUrl: './assess-life-settings.component.html',
  styleUrls: ['./assess-life-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderModule,
    PageLoadingModule
  ]
})
export class AssessLifeSettingsComponent implements OnInit {

  isMobile$ = this.screensize.isMobile$
  loading = signal<boolean>(true)

  form = new FormGroup({
    preferredDay: new FormControl<WeekdayWithNever>('sunday', { nonNullable: true }),
    preferredTime: new FormControl<string>('19:00', { nonNullable: true }),
    dearFutureSelf: new FormControl<AssessLifeIntervalWithNever>('yearly', { nonNullable: true }),
    environment: new FormControl<AssessLifeIntervalWithNever>('quarterly', { nonNullable: true }),
    explore: new FormControl<AssessLifeIntervalWithNever>('quarterly', { nonNullable: true }),
    forgive: new FormControl<AssessLifeIntervalWithNever>('monthly', { nonNullable: true }),
    gratitude: new FormControl<AssessLifeIntervalWithNever>('weekly', { nonNullable: true }),
    imagine: new FormControl<AssessLifeIntervalWithNever>('yearly', { nonNullable: true }),
    learn: new FormControl<AssessLifeIntervalWithNever>('weekly', { nonNullable: true }),
    prioritizeGoals: new FormControl<AssessLifeIntervalWithNever>('monthly', { nonNullable: true }),
    proud: new FormControl<AssessLifeIntervalWithNever>('weekly', { nonNullable: true }),
    timeManagement: new FormControl<AssessLifeIntervalWithNever>('weekly', { nonNullable: true }),
    wheelOfLife: new FormControl<AssessLifeIntervalWithNever>('quarterly', { nonNullable: true }),
  })

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController,
    private screensize: ScreensizeService,
    private service: AssessLifeSettingsService
  ) {
    this.form.valueChanges.subscribe(value => {
      if (!this.auth.uid) return
      const settings = createAssessLifeSettings(value)
      this.service.save(this.auth.uid, settings)
    })
  }

  async ngOnInit() {
    const uid = await this.auth.getUID()
    const settings = await this.service.getSettings(uid)
    if (settings) this.form.patchValue(settings)
    this.loading.set(false)
  }

  async openTimePicker() {
    const control = this.form.get('preferredTime')
    if (!control) return

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time', hideRemove: true, value: control.value }
    })
    popover.onDidDismiss().then(({ data }) => {
      if (data && this.form) {
        control.setValue(data)
        control.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}