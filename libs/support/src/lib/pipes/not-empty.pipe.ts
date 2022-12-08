
import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { SupportsGroupedByGoal } from '@strive/model'

@Pipe({ name: 'isNotEmpty' })
export class SupportNotEmptyPipe implements PipeTransform {
  transform(support: SupportsGroupedByGoal) {
    console.log(support)
    if (support.supports.length) return true
    if (support.milestones.some(milestone => milestone.supports.length)) return true
    console.log('returning false')
    return false
  }
}

@NgModule({
  exports: [SupportNotEmptyPipe],
  declarations: [SupportNotEmptyPipe]
})
export class SupportNotEmptyPipeModule { } 