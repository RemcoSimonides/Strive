import { Pipe, PipeTransform } from '@angular/core'
import { AssessLifeInterval, AssessLifeIntervalWithNever, getInterval } from '@strive/model'

@Pipe({ name: 'interval', standalone: true })
export class AssessLifeIntervalPipe implements PipeTransform {

  transform(value: AssessLifeInterval): string {
    return getInterval(value)
  }
}

@Pipe({ name: 'replaceInterval', standalone: true })
export class AssessLifeReplaceIntervalPipe implements PipeTransform {

  transform(value: string, interval: AssessLifeIntervalWithNever): string {
    if (interval === 'never') throw new Error('Interval never is not allowed in replaceInterval pipe')
    return value.replace('{interval}', getInterval(interval))
  }
}