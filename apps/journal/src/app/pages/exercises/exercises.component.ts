import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Affirmations, DailyGratefulness, DearFutureSelf, exercises } from '@strive/model'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { Observable, of, switchMap } from 'rxjs'
import { AffirmationService } from '@strive/exercises/affirmation/affirmation.service'
import { DailyGratefulnessService } from '@strive/exercises/daily-gratefulness/daily-gratefulness.service'
import { DearFutureSelfService } from '@strive/exercises/dear-future-self/dear-future-self.service'
import { AuthService } from '@strive/user/auth/auth.service'

@Component({
  selector: 'journal-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExercisesComponent {
  exercises = exercises

  affirmations$: Observable<Affirmations | undefined>
  dailyGratefulness$: Observable<DailyGratefulness | undefined>
  dearFutureSelf$: Observable<DearFutureSelf | undefined>

  constructor(
    private auth: AuthService,
    private affirmationService: AffirmationService,
    private dailyGratefulnessService: DailyGratefulnessService,
    private dearFutureSelfService: DearFutureSelfService,
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({
      title: 'Exercises - Strive Journal',
      description: 'Dear Future Self, Affirmations, Daily Gratefulness and more'
    })

    this.affirmations$ = this.auth.profile$.pipe(
      switchMap(profile => profile?.uid ? this.affirmationService.getAffirmations$(profile.uid) : of(undefined))
    )

    this.dailyGratefulness$ = this.auth.profile$.pipe(
      switchMap(profile => profile?.uid ? this.dailyGratefulnessService.getSettings$(profile.uid) : of(undefined))
    )

    this.dearFutureSelf$ = this.auth.user$.pipe(
      switchMap(profile => profile?.uid ? this.dearFutureSelfService.getSettings$(profile.uid) : of(undefined))
    )
  }
}