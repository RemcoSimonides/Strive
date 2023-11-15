import { Pipe, PipeTransform } from '@angular/core'
import { SelfReflectFrequency, SelfReflectFrequencyWithNever, getFrequency } from '@strive/model'

export function replaceFrequency(value: string, frequency: SelfReflectFrequencyWithNever): string {
  if (frequency === 'never') throw new Error('Frequency never is not allowed in replaceFrequency pipe')
  return value.replace('{frequency}', getFrequency(frequency))
}

@Pipe({ name: 'frequency', standalone: true })
export class SelfReflectFrequencyPipe implements PipeTransform {

  transform(value: SelfReflectFrequency): string {
    return getFrequency(value)
  }
}

@Pipe({ name: 'replaceFrequency', standalone: true })
export class SelfReflectReplaceFrequencyPipe implements PipeTransform {

  transform(value: string, frequency: SelfReflectFrequencyWithNever): string {
    return replaceFrequency(value, frequency)
  }
}