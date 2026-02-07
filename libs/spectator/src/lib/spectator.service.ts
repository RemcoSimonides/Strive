import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, setDoc } from '@angular/fire/firestore'
import { collectionGroup, collection, doc, getDoc, getDocs, query, where, QueryConstraint } from 'firebase/firestore'
import { createConverter, docData, collectionData } from '@strive/utils/firebase'
import { map, Observable } from 'rxjs'

import { Spectator, createSpectator } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'

const converter = createConverter<Spectator>(createSpectator, 'uid')

@Injectable({
  providedIn: 'root'
})
export class SpectatorService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)
  private auth = inject(AuthService)

  docData(spectatorUid: string, options: { uid: string }): Observable<Spectator | undefined> {
    const docRef = doc(this.firestore, `Users/${options.uid}/Spectators/${spectatorUid}`).withConverter(converter)
    return docData(this.injector, docRef)
  }

  private collectionData(constraints: QueryConstraint[], options: { uid: string }): Observable<Spectator[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Spectators`).withConverter(converter)
    const q = query(colRef, ...constraints)
    return collectionData(this.injector, q, { idField: 'uid' })
  }

  private collectionGroupData(constraints: QueryConstraint[]): Observable<Spectator[]> {
    const ref = collectionGroup(this.firestore, 'Spectators').withConverter(converter)
    const q = query(ref, ...constraints)
    return collectionData(this.injector, q, { idField: 'uid' })
  }

  private getDoc(spectatorUid: string, options: { uid: string }): Promise<Spectator | undefined> {
    const docRef = doc(this.firestore, `Users/${options.uid}/Spectators/${spectatorUid}`).withConverter(converter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  private async getDocs(constraints: QueryConstraint[], options: { uid: string }): Promise<Spectator[]> {
    const colRef = collection(this.firestore, `Users/${options.uid}/Spectators`).withConverter(converter)
    const q = query(colRef, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()).filter((s): s is Spectator => !!s)
  }

  private async getDocsGroup(constraints: QueryConstraint[]): Promise<Spectator[]> {
    const ref = collectionGroup(this.firestore, 'Spectators').withConverter(converter)
    const q = query(ref, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()).filter((s): s is Spectator => !!s)
  }

  upsert(spectator: Partial<Spectator> & { uid: string }, options: { uid: string }) {
    const docRef = doc(this.firestore, `Users/${options.uid}/Spectators/${spectator.uid}`).withConverter(converter)
    return setDoc(docRef, spectator as Spectator, { merge: true })
  }

  getCurrentSpectator(uidToBeSpectated: string) {
    const uid = this.auth.uid()
    if (!uid) throw new Error('')
    return this.getSpectator(uid, uidToBeSpectated)
  }

  getSpectator(uidSpectator: string, uidToBeSpectated: string) {
    return this.getDoc(uidSpectator, { uid: uidToBeSpectated })
  }

  getSpectators(uid: string) {
    return this.getDocs([where('isSpectator', '==', true)], { uid })
  }

  getSpectators$(uid: string) {
    return this.collectionData([where('isSpectator', '==', true)], { uid })
  }

  getSpectating(uid: string) {
    return this.getDocsGroup([where('uid', '==', uid)]).then(
      spectators => spectators.filter(spectator => spectator.isSpectator)
    )
  }

  getSpectating$(uid: string) {
    return this.collectionGroupData([where('uid', '==', uid)]).pipe(
      map(spectators => spectators.filter(spectator => spectator.isSpectator))
    )
  }
}
