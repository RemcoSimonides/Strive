import { Injectable } from '@angular/core';
import { arrayUnion, DocumentSnapshot, getFirestore } from 'firebase/firestore';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
import { DearFutureSelf, Message } from '@strive/model';
import { toDate } from '@strive/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class DearFutureSelfService extends FireCollection<DearFutureSelf> {
  readonly path = 'Users/:uid/Exercises'

  constructor() {
    super(getFirestore())
  }

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
