import { Injectable, inject } from '@angular/core'
import { doc, docData as _docData, Firestore, getDoc, setDoc } from '@angular/fire/firestore'
import { createConverter } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { Affirmations } from '@strive/model'

const factory = (data: any): Affirmations => ({
  id: data.id ?? '',
  affirmations: data.affirmations ?? [],
  times: data.times ?? [],
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date()
})

const converter = createConverter<Affirmations>(factory)

@Injectable({providedIn: 'root'})
export class AffirmationService {
  private firestore = inject(Firestore)

  getAffirmations$(uid: string): Observable<Affirmations | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/Affirmations`).withConverter(converter)
    return _docData(docRef)
  }

  getAffirmations(uid: string): Promise<Affirmations | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/Affirmations`).withConverter(converter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  saveAffirmations(uid: string, affirmations: Partial<Affirmations>) {
    const docRef = doc(this.firestore, `Users/${uid}/Exercises/Affirmations`).withConverter(converter)
    return setDoc(docRef, affirmations as Affirmations, { merge: true })
  }
}
