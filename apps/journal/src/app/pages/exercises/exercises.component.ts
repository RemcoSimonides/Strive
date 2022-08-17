import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Affirmations, DailyGratefulness, DearFutureSelf, exercises } from '@strive/model'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { UserService } from '@strive/user/user/user.service'
import { Observable, of, switchMap, tap } from 'rxjs'
import { AffirmationService } from '@strive/exercises/affirmation/affirmation.service'
import { DailyGratefulnessService } from '@strive/exercises/daily-gratefulness/daily-gratefulness.service'
import { DearFutureSelfService } from '@strive/exercises/dear-future-self/dear-future-self.service'

@Component({
  selector: 'strive-exercises',
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
    private affirmationService: AffirmationService,
    private dailyGratefulnessService: DailyGratefulnessService,
    private dearFutureSelfService: DearFutureSelfService,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private user: UserService
  ) {
    this.seo.generateTags({ title: 'Exercises - Strive Journal' })

    this.affirmations$ = this.user.user$.pipe(
      switchMap(user => user?.uid ? this.affirmationService.getAffirmations$(user.uid) : of(undefined))
    )

    this.dailyGratefulness$ = this.user.user$.pipe(
      switchMap(user => user?.uid ? this.dailyGratefulnessService.getSettings$(user.uid) : of(undefined))
    )

    this.dearFutureSelf$ = this.user.user$.pipe(
      switchMap(user => user?.uid ? this.dearFutureSelfService.getSettings$(user.uid) : of(undefined))
    )
  }
}