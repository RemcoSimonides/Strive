import { Pipe, PipeTransform } from '@angular/core'
import { SelfReflectInterval, SelfReflectIntervalWithNever, getInterval } from '@strive/model'

export function replaceInterval(value: string, interval: SelfReflectIntervalWithNever): string {
  if (interval === 'never') throw new Error('Interval never is not allowed in replaceInterval pipe')
  return value.replace('{interval}', getInterval(interval))
}

@Pipe({ name: 'interval', standalone: true })
export class SelfReflectIntervalPipe implements PipeTransform {

  transform(value: SelfReflectInterval): string {
    return getInterval(value)
  }
}

@Pipe({ name: 'replaceInterval', standalone: true })
export class SelfReflectReplaceIntervalPipe implements PipeTransform {

  transform(value: string, interval: SelfReflectIntervalWithNever): string {
    return replaceInterval(value, interval)
  }
}