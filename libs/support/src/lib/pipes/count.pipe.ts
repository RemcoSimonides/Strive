
import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { SupportsGroupedByGoal } from '@strive/model'

@Pipe({ name: 'count' })
export class SupportCounterPipe implements PipeTransform {
  transform(goal: SupportsGroupedByGoal, id?: string) {
    let counter = 0

    for (const support of goal.supports) {
      if (id === support.id) return counter
      counter++
    }

    for (const milestone of goal.milestones) {
      if (milestone.id === id) return counter

      for (const support of milestone.supports) {
        if (support.id === id) return counter
        counter++
      }
    }

    return counter
  }
}

@Pipe({ name: 'total' })
export class SupportTotalPipe implements PipeTransform {
  transform(goal: SupportsGroupedByGoal) {
    let counter = goal.supports.length

    for (const milestone of goal.milestones) {
      counter = counter + milestone.supports.length
    }

    return counter
  }
}

@NgModule({
  exports: [SupportCounterPipe, SupportTotalPipe],
  declarations: [SupportCounterPipe, SupportTotalPipe]
})
export class SupportCounterPipeModule { } 