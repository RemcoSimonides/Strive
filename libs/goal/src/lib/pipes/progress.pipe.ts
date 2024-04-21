import { Pipe, PipeTransform } from '@angular/core'
import { Goal, inProgress, isFinished } from '@strive/model'

export function getProgress(goal: Goal): number {
  if (goal.status !== 'pending') return 1
  return goal.tasksCompleted / goal.tasksTotal
}

@Pipe({ name: 'progress', standalone: true })
export class ProgressPipe implements PipeTransform {
  transform(goal: Goal) {
    return getProgress(goal)
  }
}


@Pipe({ name: 'toProgressLabel', standalone: true })
export class ProgressLabelPipe implements PipeTransform {
  transform(goal: Goal) {
    if (isFinished(goal)) return 'Finished'
    if (inProgress(goal)) return 'In Progress'
    return 'To Start'
  }
}
