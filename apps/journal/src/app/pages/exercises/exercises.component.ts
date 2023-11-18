import { ChangeDetectionStrategy, Component, Pipe, PipeTransform } from '@angular/core'
import { SelfReflectSettings, exercises, ExerciseType } from '@strive/model'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { of, switchMap } from 'rxjs'
import { AuthService } from '@strive/auth/auth.service'
import { ExerciseService, ExerciseSettings } from '@strive/exercises/exercise.service'
import { smartJoin } from '@strive/utils/helpers'

@Pipe({ name: 'frequencies', standalone: true })
export class SelfReflectDescriptionPipe implements PipeTransform {
  transform({ questions }: SelfReflectSettings) {
    const frequencies = []
    if (questions.some(({ frequency }) => frequency === 'daily')) frequencies.push('daily')
    if (questions.some(({ frequency }) => frequency === 'weekly')) frequencies.push('weekly')
    if (questions.some(({ frequency }) => frequency === 'monthly')) frequencies.push('monthly')
    if (questions.some(({ frequency }) => frequency === 'quarterly')) frequencies.push('quarterly')
    if (questions.some(({ frequency }) => frequency === 'yearly')) frequencies.push('yearly')

    return smartJoin(frequencies, ', ', ' and ')
  }
}

@Pipe({ name: 'get' })
export class GetExercisePipe implements PipeTransform {
  transform(settings: ExerciseSettings[], exercise: ExerciseType) {
    return settings.find(s => s.id === exercise)
  }
}

@Component({
  selector: 'journal-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExercisesPageComponent {
  exercises = exercises

  exercises$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.exerciseService.valueChanges({ uid: profile.uid }) : of([]))
  )

  isMobile$ = this.screensize.isMobile$

  constructor(
    private auth: AuthService,
    private exerciseService: ExerciseService,
    private screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({
      title: 'Exercises - Strive Journal',
      description: 'Dear Future Self, Affirmations, Daily Gratitude and more'
    })
  }
}