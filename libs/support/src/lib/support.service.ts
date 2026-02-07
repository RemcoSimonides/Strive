import { Injectable, inject } from '@angular/core'
import { Firestore, setDoc, addDoc, deleteDoc, collectionData as _collectionData, docData } from '@angular/fire/firestore'
import { collection, query, QueryConstraint, where, collectionGroup, doc } from 'firebase/firestore'
import { createConverter } from '@strive/utils/firebase'

import { of, switchMap, map, shareReplay, Observable } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'

import { createSupportBase, SupportBase } from '@strive/model'

const converter = createConverter<SupportBase>(createSupportBase)

@Injectable({ providedIn: 'root' })
export class SupportService {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);

  hasSupportNeedingDecision$ = this.auth.uid$.pipe(
    switchMap(uid => {
      if (!uid) return of(false)
      const query = [where('supporterId', '==', uid)]

      return this.collectionData(query).pipe(
        map(supports => supports.filter(support => support.needsDecision || support.counterNeedsDecision)),
        map(supports => !!supports.length)
      )
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  docData(id: string, options: { goalId: string }): Observable<SupportBase | undefined> {
    const path = `Goals/${options.goalId}/Supports/${id}`
    const docRef = doc(this.firestore, path).withConverter(converter)
    return docData(docRef, { idField: 'id' })
  }

  collectionData(queryConstraints: QueryConstraint[], options?: { goalId: string }): Observable<SupportBase[]> {
    const path = `Goals/${options?.goalId}/Supports`
    const ref = options?.goalId
      ? collection(this.firestore, path).withConverter(converter)
      : collectionGroup(this.firestore, 'Supports').withConverter(converter)
    const q = query(ref, ...queryConstraints)
    return _collectionData(q, { idField: 'id' })
  }

  upsert(support: Partial<SupportBase>, options: { goalId: string }) {
    const path = `Goals/${options.goalId}/Supports`

    if (support.id) {
      const docRef = doc(this.firestore, `${path}/${support.id}`).withConverter(converter)
      return setDoc(docRef, support, { merge: true })
    } else {
      const colRef = collection(this.firestore, path).withConverter(converter)
      return addDoc(colRef, support)
    }
  }

  remove(id: string, options: { goalId: string }) {
    const path = `Goals/${options.goalId}/Supports/${id}`
    const ref = doc(this.firestore, path)
    return deleteDoc(ref)
  }
}
