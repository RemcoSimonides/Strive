import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore } from '@angular/fire/firestore';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
import { DearFutureSelf, Message } from './dear-future-self.firestore';
import { arrayUnion, Timestamp } from 'firebase/firestore';

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
    const setting = { ...snapshot.data(), id: snapshot.id }
    setting.messages = setting.messages.map(message => {
      message.createdAt = (message.createdAt as Timestamp).toDate()
      message.deliveryDate = (message.deliveryDate as Timestamp).toDate()
      return message
    })
    return setting
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
