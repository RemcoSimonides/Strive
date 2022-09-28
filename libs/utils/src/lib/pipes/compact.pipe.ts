import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { Pipe, PipeTransform } from '@angular/core'

@Pipe({ name: 'compact' })
export class CompactPipe implements PipeTransform {
  transform(value: number) {
    const formatter = Intl.NumberFormat('en', { notation: 'compact' })
    return formatter.format(value)
  }
}

@NgModule({
  declarations: [CompactPipe],
  imports: [CommonModule],
  exports: [CompactPipe]
})
export class CompactPipeModule { }
