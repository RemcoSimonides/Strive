
import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { receiverIsGoal, Support } from '@strive/model';

@Pipe({ name: 'recipient' })
export class DisplayRecipientPipe implements PipeTransform {

  transform(support: Support) {
    const recipient = support.source.receiver
    if (!recipient) return 'Give to choose recipient'
    if (receiverIsGoal(recipient)) return recipient.title
    return recipient.username
  }
}

@NgModule({
  exports: [DisplayRecipientPipe],
  declarations: [DisplayRecipientPipe]
})
export class RecipientPipeModule { } 