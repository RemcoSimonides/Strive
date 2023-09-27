import { Pipe, PipeTransform } from '@angular/core'

/**
 * Example with (['A', 'B', 'C'], ', ', ' & ')
 * output : "A, B & C"
 * @param str
 * @param joinWith
 * @param endWith
 * @returns
 */
export function smartJoin(str: string[], joinWith = ', ', endWith = ', ') {
  const last = str.pop()
  return `${str.join(joinWith)}${str.length ? endWith : ''}${last || ''}`
}

@Pipe({ name: 'smartJoin', standalone: true })
export class SmartJoinPipe implements PipeTransform {
  transform(str: string[], joinWith = ', ', endWith = ', ') {
    return smartJoin(str, joinWith, endWith)
  }
}
