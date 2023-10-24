import { Pipe, PipeTransform } from '@angular/core'
import { smartJoin } from '../helpers'

@Pipe({ name: 'smartJoin', standalone: true })
export class SmartJoinPipe implements PipeTransform {
  transform(str: string[], joinWith = ', ', endWith = ', ') {
    return smartJoin(str, joinWith, endWith)
  }
}
