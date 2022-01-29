import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Subtask } from '../+state/milestone.firestore';

@Pipe({ name: 'subtasksCompleted' })
export class SubtasksCompletedPipe implements PipeTransform {

  transform(subtasks: Subtask[]): string {
    const completed = subtasks.filter(task => task.completed).length
    return `${completed}/${subtasks.length}`
  }
}

@NgModule({
  exports: [SubtasksCompletedPipe],
  declarations: [SubtasksCompletedPipe]
})
export class SubtaskPipeModule { } 