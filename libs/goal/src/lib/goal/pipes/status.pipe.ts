import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { GoalStatus } from '@strive/model'

@Pipe({ name: 'status' })
export class StatusPipe implements PipeTransform {

  map: Record<GoalStatus, string> = {
    bucketlist: 'In Future',
    active: 'Current Focus',
    finished: 'Finished'
  }

  transform(status: GoalStatus) {
    return this.map[status];
  }
}

@NgModule({
  exports: [StatusPipe],
  declarations: [StatusPipe]
})
export class StatusPipeModule { }