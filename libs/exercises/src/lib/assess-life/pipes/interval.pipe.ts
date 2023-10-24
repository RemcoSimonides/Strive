import { Pipe, PipeTransform } from '@angular/core'
import { AssessLifeInterval, getInterval } from '@strive/model'

@Pipe({ name: 'interval', standalone: true })
export class AssessLifeIntervalPipe implements PipeTransform {

  transform(value: AssessLifeInterval): string {
    return getInterval(value)
  }
}