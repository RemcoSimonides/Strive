import { Pipe, PipeTransform } from '@angular/core'
import { Subtask } from '@strive/model'

@Pipe({ name: 'subtasksCompleted', standalone: true })
export class SubtasksCompletedPipe implements PipeTransform {

  transform(subtasks: Subtask[]): string {
    const completed = subtasks.filter(task => task.completed).length
    return `${completed}/${subtasks.length}`
  }
}
