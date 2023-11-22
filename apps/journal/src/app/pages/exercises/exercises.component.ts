import { ChangeDetectionStrategy, Component, Pipe, PipeTransform } from '@angular/core'
import { SelfReflectSettings, exercises, ExerciseType, Affirmations, DearFutureSelf, DailyGratitude, WheelOfLifeSettings } from '@strive/model'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { Observable, map, of, switchMap } from 'rxjs'
import { AuthService } from '@strive/auth/auth.service'
import { ExerciseService, ExerciseSettings } from '@strive/exercises/exercise.service'
import { smartJoin, capitalizeFirstLetter } from '@strive/utils/helpers'
import { format, isPast } from 'date-fns'

function getFrequencies({ questions }: SelfReflectSettings) {
  const frequencies = []
  if (questions.some(({ frequency }) => frequency === 'daily')) frequencies.push('daily')
  if (questions.some(({ frequency }) => frequency === 'weekly')) frequencies.push('weekly')
  if (questions.some(({ frequency }) => frequency === 'monthly')) frequencies.push('monthly')
  if (questions.some(({ frequency }) => frequency === 'quarterly')) frequencies.push('quarterly')
  if (questions.some(({ frequency }) => frequency === 'yearly')) frequencies.push('yearly')

  return smartJoin(frequencies, ', ', ' and ')
}

@Pipe({ name: 'get' })
export class GetExercisePipe implements PipeTransform {
  transform(settings: ExerciseSettings[], exercise: ExerciseType) {
    return settings.find(s => s.id === exercise)
  }
}

interface Exercise {
  title: string
  image: string
  link: string
  description: string
  isActive: boolean
  setting?: ExerciseSettings
}

@Component({
  selector: 'journal-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExercisesPageComponent {
  exercises$: Observable<Exercise[]> = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.exerciseService.valueChanges({ uid: profile.uid }) : of([])),
    map(exerciseSettings => exercises.map(exercise => {
      const setting = exerciseSettings.find(s => s.id === exercise.id)
      if (!setting) return { ...exercise, isActive: false } as Exercise

      let description

      if (exercise.id === 'SelfReflect') {
        const selfReflectSettings = setting as SelfReflectSettings
        const frequencies = getFrequencies(selfReflectSettings)
        const preferredDay = capitalizeFirstLetter(selfReflectSettings.preferredDay)
        description = `Receiving ${frequencies} on ${preferredDay} at ${selfReflectSettings.preferredTime}`
      } else if (exercise.id === 'Affirmations') {
        const affirmationSettings = setting as Affirmations
        const length = affirmationSettings.affirmations.length
        description = `${length} ${length === 1 ? 'Affirmation' : 'Affirmations'} set`
      } else if (exercise.id === 'DearFutureSelf') {
        const dearFutureSelfSettings = setting as DearFutureSelf
        const received = dearFutureSelfSettings.messages.filter(message => isPast(message.deliveryDate)).length
        const total = dearFutureSelfSettings.messages.length
        description = `${received} of ${total} letters received`
      } else if (exercise.id === 'DailyGratitude') {
        const dailyGratitudeSettings = setting as DailyGratitude
        const time = format(dailyGratitudeSettings.time, 'h:mm a')
        description = `Receiving daily at ${time}`
      } else if (exercise.id === 'WheelOfLife') {
        const wheelOfLifeSettings = setting as WheelOfLifeSettings
        description = `Receiving reminder ${wheelOfLifeSettings.interval}`
      }

      return {
        ...exercise,
        description,
        isActive: true,
        setting
      } as Exercise
    })),
    map(exercises => exercises.sort((a, b) => a.isActive === b.isActive ? 0 : a.isActive ? -1 : 1))
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