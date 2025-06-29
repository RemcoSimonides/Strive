import { Pipe, PipeTransform } from '@angular/core'
import { ExerciseSettings } from '@strive/exercises/exercise.service'
import { DearFutureSelf } from '@strive/model'
import { compareAsc, isFuture } from 'date-fns'


@Pipe({ name: 'nextLetter', standalone: true })
export class NextLetterPipe implements PipeTransform {
  transform(setting?: ExerciseSettings) {
    if (!setting) return
    if (setting.id !== 'DearFutureSelf') return
    const future = (setting as DearFutureSelf).messages.filter(message => isFuture(message.deliveryDate))
    if (!future.length) return
    const asc = future.sort((a, b) => compareAsc(a.deliveryDate, b.deliveryDate))
    return asc[0]
  }
}
