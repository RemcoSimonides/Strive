import { Pipe, PipeTransform } from '@angular/core'
import { ExerciseSettings } from '@strive/exercises/exercise.service'
import { DearFutureSelf, Message } from '@strive/model'
import { compareAsc, isFuture, isPast } from 'date-fns'


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

@Pipe({ name: 'received', standalone: true })
export class ReceivedPipe implements PipeTransform {
  transform(setting?: DearFutureSelf): Message[] {
    if (!setting?.messages?.length) return []
    return setting.messages.filter(message => isPast(message.deliveryDate))
  }
}
