import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, addDoc, setDoc, deleteDoc } from '@angular/fire/firestore'
import { collection, doc, DocumentData, FirestoreDataConverter, getDocs, query, QueryConstraint, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions } from 'firebase/firestore'
import { collectionData, docData, toDate } from '@strive/utils/firebase'
import { Observable } from 'rxjs'

import { AuthService } from '@strive/auth/auth.service'

import { createMilestone, Milestone } from '@strive/model'
import { endOfDay } from 'date-fns'

@Injectable({ providedIn: 'root' })
export class MilestoneService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)
  private auth = inject(AuthService)

  private converter: FirestoreDataConverter<Milestone | undefined> = {
    toFirestore: (milestone: Milestone) => {
      if (milestone.deadline) milestone.deadline = endOfDay(milestone.deadline)

      const isUpdate = !!milestone['id']
      const timestamp = serverTimestamp()
      const data = { ...milestone } as DocumentData

      if (!isUpdate) {
        data['createdAt'] = timestamp
      }
      data['updatedBy'] = this.auth.uid()
      data['updatedAt'] = timestamp

      delete data['id']
      return data
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
      if (snapshot.exists()) {
        const data = snapshot.data(options)
        return createMilestone(toDate({ ...data, id: snapshot.id, path: snapshot.ref.path }))
      } else {
        return undefined
      }
    }
  }

  docData(milestoneId: string, options: { goalId: string }): Observable<Milestone | undefined> {
    const docRef = doc(this.firestore, `Goals/${options.goalId}/Milestones/${milestoneId}`).withConverter(this.converter)
    return docData(this.injector, docRef)
  }

  collectionData(constraints: QueryConstraint[], options: { goalId: string }): Observable<Milestone[]> {
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Milestones`).withConverter(this.converter)
    const q = query(colRef, ...constraints)
    return collectionData(this.injector, q, { idField: 'id' }) as Observable<Milestone[]>
  }

  async getDocs(constraints: QueryConstraint[], options: { goalId: string }): Promise<Milestone[]> {
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Milestones`).withConverter(this.converter)
    const q = query(colRef, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()).filter((m): m is Milestone => !!m)
  }

  async add(milestone: Milestone | Milestone[], options: { goalId: string }): Promise<string | string[]> {
    const colRef = collection(this.firestore, `Goals/${options.goalId}/Milestones`).withConverter(this.converter)
    if (Array.isArray(milestone)) {
      const ids: string[] = []
      for (const m of milestone) {
        const docRef = await addDoc(colRef, m)
        ids.push(docRef.id)
      }
      return ids
    }
    const docRef = await addDoc(colRef, milestone)
    return docRef.id
  }

  upsert(milestone: Partial<Milestone> & { id: string }, options: { goalId: string }) {
    const docRef = doc(this.firestore, `Goals/${options.goalId}/Milestones/${milestone.id}`).withConverter(this.converter)
    return setDoc(docRef, milestone as Milestone, { merge: true })
  }

  update(milestone: Partial<Milestone> & { id: string }, options: { goalId: string }): Promise<void>
  update(milestoneId: string, data: Partial<Milestone>, options: { goalId: string }): Promise<void>
  update(milestoneOrId: (Partial<Milestone> & { id: string }) | string, dataOrOptions: Partial<Milestone> | { goalId: string }, maybeOptions?: { goalId: string }): Promise<void> {
    let id: string
    let data: Partial<Milestone>
    let goalId: string
    if (typeof milestoneOrId === 'string') {
      id = milestoneOrId
      data = dataOrOptions as Partial<Milestone>
      goalId = maybeOptions!.goalId
    } else {
      id = milestoneOrId.id
      data = milestoneOrId
      goalId = (dataOrOptions as { goalId: string }).goalId
    }
    const docRef = doc(this.firestore, `Goals/${goalId}/Milestones/${id}`).withConverter(this.converter)
    return setDoc(docRef, data as Milestone, { merge: true })
  }

  remove(milestoneId: string, options: { goalId: string }) {
    const ref = doc(this.firestore, `Goals/${options.goalId}/Milestones/${milestoneId}`)
    return deleteDoc(ref)
  }
}
