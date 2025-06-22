
import { Pipe, PipeTransform, inject } from '@angular/core'
import { Support } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'

@Pipe({ name: 'isSupporter', standalone: true })
export class IsSupporterPipe implements PipeTransform {
  private auth = inject(AuthService);

  transform(support: Support) {
    return support.supporterId === this.auth.uid
  }
}

@Pipe({ name: 'isRecipient', standalone: true })
export class IsRecipientPipe implements PipeTransform {
  private auth = inject(AuthService);

  transform(support: Support) {
    return support.recipientId === this.auth.uid
  }
}
