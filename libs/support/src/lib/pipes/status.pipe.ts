
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Support, SupportStatus } from '@strive/model';

function getStatusLabel(support: Support) {
  const label: Record<SupportStatus, string> = {
    open: '',
    rejected: 'Rejected',
    canceled: 'Canceled',
    waiting_to_be_paid: 'Waiting to be paid',
    paid: 'Given'
  }

  if (support.status === 'open') {
    return support.source.milestone?.id
      ? 'Waiting for milestone to be completed'
      : 'Waiting for goal to be completed'
  } else {
    return label[support.status]
  }
}

@Pipe({ name: 'supportStatus' })
export class SupportStatusPipe implements PipeTransform {

  transform(support: Support) {
    return getStatusLabel(support)
  }
}

@NgModule({
  exports: [SupportStatusPipe],
  declarations: [SupportStatusPipe]
})
export class SupportStatusPipeModule { } 