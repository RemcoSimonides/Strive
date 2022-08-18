
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { Support, SupportStatus } from '@strive/model';

function getStatusLabel(support: Support) {
  const label: Record<SupportStatus, string> = {
    open: '',
    rejected: 'Rejected',
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

@Pipe({ name: 'filterStatus' })
export class FilterStatusPipe implements PipeTransform {
  transform(supports: Support[], status: SupportStatus) {
    return supports.filter(supports => supports.status === status)
  }
}

@NgModule({
  exports: [SupportStatusPipe, FilterStatusPipe],
  declarations: [SupportStatusPipe, FilterStatusPipe]
})
export class SupportStatusPipeModule { } 