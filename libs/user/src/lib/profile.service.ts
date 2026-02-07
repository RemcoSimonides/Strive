import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, deleteDoc, setDoc } from '@angular/fire/firestore'
import { collection, doc, getDoc, getDocs, query, QueryConstraint, where } from 'firebase/firestore'
import { createConverter, docData, collectionData } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { createUser, User } from '@strive/model'

const converter = createConverter<User>(createUser, 'uid')

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)

  docData(uid: string): Observable<User | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}`).withConverter(converter)
    return docData(this.injector, docRef)
  }

  collectionData(constraints: QueryConstraint[] = []): Observable<User[]> {
    const colRef = collection(this.firestore, 'Users').withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(this.injector, q, { idField: 'uid' })
  }

  getDoc(uid: string): Promise<User | undefined> {
    const docRef = doc(this.firestore, `Users/${uid}`).withConverter(converter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  async getDocs(uids: string[]): Promise<User[]> {
    if (!uids.length) return []
    const colRef = collection(this.firestore, 'Users').withConverter(converter)
    const q = query(colRef, where('__name__', 'in', uids))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()).filter((u): u is User => !!u)
  }

  update(user: Partial<User> & { uid: string }) {
    const { uid, ...data } = user
    const docRef = doc(this.firestore, `Users/${uid}`).withConverter(converter)
    return setDoc(docRef, { uid, ...data } as User, { merge: true })
  }

  remove(uid: string) {
    const ref = doc(this.firestore, `Users/${uid}`)
    return deleteDoc(ref)
  }
}
