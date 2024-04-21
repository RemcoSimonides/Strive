
import { Pipe, PipeTransform } from '@angular/core'
import { Support } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'

@Pipe({ name: 'isSupporter', standalone: true })
export class IsSupporterPipe implements PipeTransform {
  constructor(private auth: AuthService) {}

  transform(support: Support) {
    return support.supporterId === this.auth.uid
  }
}

@Pipe({ name: 'isRecipient', standalone: true })
export class IsRecipientPipe implements PipeTransform {
  constructor(private auth: AuthService) {}

  transform(support: Support) {
    return support.recipientId === this.auth.uid
  }
}
