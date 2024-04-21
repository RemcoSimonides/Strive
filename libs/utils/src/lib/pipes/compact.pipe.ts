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
