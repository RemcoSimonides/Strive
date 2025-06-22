
import { Pipe, PipeTransform, inject } from '@angular/core'
import { AuthService } from '@strive/auth/auth.service'
import { Support, SupportsGroupedByGoal } from '@strive/model'

@Pipe({ name: 'count', standalone: true })
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

@Pipe({ name: 'needsDecision', standalone: true })
export class NeedsDecisionPipe implements PipeTransform {
  private auth = inject(AuthService);

  transform(goal: SupportsGroupedByGoal, id?: string) {
    if (!this.auth.uid) return false

    const needsDecision = (support: Support) => {
      const isSupporter = support.supporterId === this.auth.uid
      const isRecipient = support.recipientId === this.auth.uid

      if (support.needsDecision && isSupporter) return true
      if (support.counterNeedsDecision && isRecipient) return true
      return false
    }

    if (goal.id === id) {
      return goal.supports.some(needsDecision)
    }

    const milestone = goal.milestones.find(milestone => milestone.id === id)
    if (milestone) {
      return milestone.supports.some(needsDecision)
    }

    const support = goal.supports.find(s => s.id === id)
    if (support) return needsDecision(support)

    for (const milestone of goal.milestones) {
      const sup = milestone.supports.find(s => s.id === id)
      if (sup) return needsDecision(sup)
    }

    return false
  }
}

@Pipe({ name: 'total', standalone: true })
export class SupportTotalPipe implements PipeTransform {
  transform(goal: SupportsGroupedByGoal) {
    let counter = goal.supports.length

    for (const milestone of goal.milestones) {
      counter = counter + milestone.supports.length
    }

    return counter
  }
}
