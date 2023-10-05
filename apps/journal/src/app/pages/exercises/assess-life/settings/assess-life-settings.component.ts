import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeSettingsService } from '@strive/exercises/assess-life/assess-life.service'
import { AssessLifeIntervalWithNever, createAssessLifeSettings } from '@strive/model'

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
    timeManagement: new FormControl<AssessLifeIntervalWithNever>('weekly', { nonNullable: true }),
    wheelOfLife: new FormControl<AssessLifeIntervalWithNever>('monthly', { nonNullable: true }),
    prioritizeGoals: new FormControl<AssessLifeIntervalWithNever>('monthly', { nonNullable: true }),
  })

  constructor(
    private auth: AuthService,
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

}