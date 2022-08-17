import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { DearFutureSelf } from '@strive/model'
import { compareAsc, isFuture, isPast } from 'date-fns'

@Pipe({ name: 'received' })
export class ReceivedLettersPipe implements PipeTransform {
    transform(setting: DearFutureSelf) {
        return setting.messages.filter(message => isPast(message.deliveryDate))
    }
}

@Pipe({ name: 'nextLetter' })
export class NextLetterPipe implements PipeTransform {
  transform(setting: DearFutureSelf) {
    const future = setting.messages.filter(message => isFuture(message.deliveryDate))
    if (!future.length) return
    const asc = future.sort((a, b) => compareAsc(a.deliveryDate, b.deliveryDate))
    return asc[0]
  }
}

@NgModule({
  exports: [NextLetterPipe, ReceivedLettersPipe],
  declarations: [NextLetterPipe, ReceivedLettersPipe]
})
export class DearFutureSelfPipeModule { }