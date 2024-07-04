import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  standalone: true,
  name: 'compact'
})
export class CompactPipe implements PipeTransform {
  transform(value: number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact' })
    return formatter.format(value)
  }
}

@Pipe({
  standalone: true,
  name: 'compactTime'
})
export class CompactTimePipe implements PipeTransform {
  transform(value: number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact', unit: 'hour' })
    return formatter.format(value)
  }
}

@Pipe({
  standalone: true,
  name: 'compactDistance'
})
export class CompactDistancePipe implements PipeTransform {
  transform(value: number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact', unit: 'kilometer' })
    return formatter.format(value)
  }
}