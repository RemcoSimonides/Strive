
import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { Support } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'

@Pipe({ name: 'isSupporter' })
export class IsSupporterPipe implements PipeTransform {
  constructor(private auth: AuthService) {}

  transform(support: Support) {
    return support.supporterId === this.auth.uid
  }
}

@Pipe({ name: 'isRecipient' })
export class IsRecipientPipe implements PipeTransform {
  constructor(private auth: AuthService) {}

  transform(support: Support) {
    return support.recipientId === this.auth.uid
  }
}

@NgModule({
  exports: [IsSupporterPipe, IsRecipientPipe],
  declarations: [IsSupporterPipe, IsRecipientPipe]
})
export class SupportRolePipeModule { } 