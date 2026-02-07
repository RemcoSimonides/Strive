import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, setDoc } from '@angular/fire/firestore'
import { arrayUnion, doc, getDoc } from 'firebase/firestore'
import { createConverter, docData } from '@strive/utils/firebase'

import { Observable } from 'rxjs'

import { DearFutureSelf, Message } from '@strive/model'

const factory = (data: any): DearFutureSelf => ({
  id: data.id ?? '',
  messages: data.messages ?? [],
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date()
})

const converter = createConverter<DearFutureSelf>(factory)

@Injectable({
  providedIn: 'root'
})
export class DearFutureSelfService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  getSettings$(uid: string): Observable<DearFutureSelf | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DearFutureSelf`).withConverter(converter)
    return docData(this.injector, docRef)
  }

  getSettings(uid: string): Promise<DearFutureSelf | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DearFutureSelf`).withConverter(converter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  addMessage(uid: string, message: Message) {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DearFutureSelf`)
    return setDoc(docRef, {
      messages: arrayUnion(message)
    }, { merge: true })
  }

  save(uid: string, settings: Partial<DearFutureSelf>) {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/DearFutureSelf`).withConverter(converter)
    return setDoc(docRef, settings as DearFutureSelf, { merge: true })
  }
}
