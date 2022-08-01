import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
import { DearFutureSelf, Message } from '@strive/model';
import { arrayUnion } from 'firebase/firestore';
import { toDate } from '@strive/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class DearFutureSelfService extends FireCollection<DearFutureSelf> {
  readonly path = 'Users/:uid/Exercises'

  constructor(db: Firestore) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<DearFutureSelf>): DearFutureSelf {
    if (!snapshot.exists()) return
    return toDate<DearFutureSelf>({ ...snapshot.data(), id: snapshot.id })
  }

  getSettings$(uid: string): Observable<DearFutureSelf> {
    return this.valueChanges('DearFutureSelf', { uid })
  }

  getSettings(uid: string): Promise<DearFutureSelf> {
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