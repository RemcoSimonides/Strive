import { Injectable } from '@angular/core'
import { arrayUnion, DocumentSnapshot } from 'firebase/firestore'
import { toDate, FireSubCollection } from 'ngfire'

import { Observable } from 'rxjs'

import { DearFutureSelf, Message } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class DearFutureSelfService extends FireSubCollection<DearFutureSelf> {
  readonly path = 'Users/:uid/Exercises'
  override readonly memorize = true

  protected override fromFirestore(snapshot: DocumentSnapshot<DearFutureSelf>): DearFutureSelf | undefined {
    if (!snapshot.exists()) return
    return toDate<DearFutureSelf>({ ...snapshot.data(), id: snapshot.id })
  }

  getSettings$(uid: string): Observable<DearFutureSelf | undefined> {
    return this.valueChanges('DearFutureSelf', { uid })
  }

  getSettings(uid: string): Promise<DearFutureSelf | undefined> {
    return this.getValue('DearFutureSelf', { uid })
  }

  addMessage(uid: string, message: Message) {
    return this.upsert({
      id: 'DearFutureSelf',
      messages: arrayUnion(message) as any
    }, { params: { uid }})
  }

  save(uid: string, settings: Partial<DearFutureSelf>) {
    return this.upsert({ ...settings, id: 'DearFutureSelf' }, { params: { uid }})
  }
}
