import { Pipe, PipeTransform } from '@angular/core'
import { SelfReflectFrequency, SelfReflectFrequencyWithNever, getFrequency, replaceFrequency } from '@strive/model'

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