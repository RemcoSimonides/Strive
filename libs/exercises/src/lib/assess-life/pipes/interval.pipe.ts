import { Pipe, PipeTransform } from '@angular/core'

export function getInterval(value: string): string {
  switch (value) {
    case 'weekly': return 'week'
    case 'monthly': return 'month'
    case 'quarterly': return 'quarter'
    case 'yearly': return 'year'
    default: return ''
  }
}

@Pipe({ name: 'interval', standalone: true })
export class AssessLifeIntervalPipe implements PipeTransform {

  transform(value: string): string {
    return getInterval(value)
  }
}