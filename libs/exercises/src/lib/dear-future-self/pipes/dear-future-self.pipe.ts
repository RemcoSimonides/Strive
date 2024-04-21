import { Pipe, PipeTransform } from '@angular/core'
import { DearFutureSelf } from '@strive/model'
import { compareAsc, isFuture } from 'date-fns'


@Pipe({ name: 'nextLetter', standalone: true })
export class NextLetterPipe implements PipeTransform {
  transform(setting: DearFutureSelf) {
    if (!setting) return
    const future = setting.messages.filter(message => isFuture(message.deliveryDate))
    if (!future.length) return
    const asc = future.sort((a, b) => compareAsc(a.deliveryDate, b.deliveryDate))
    return asc[0]
  }
}
