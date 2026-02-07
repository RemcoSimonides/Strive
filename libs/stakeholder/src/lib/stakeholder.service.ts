import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, setDoc, addDoc, deleteDoc } from '@angular/fire/firestore'
import { getDoc, getDocs, serverTimestamp, collectionGroup, doc, FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions, collection, QueryConstraint, query, UpdateData } from 'firebase/firestore'
import { collectionData, docData, toDate } from '@strive/utils/firebase'

import { AuthService } from '@strive/auth/auth.service'

import { GoalStakeholder, createGoalStakeholder, createGoal } from '@strive/model'
import { Observable } from 'rxjs'

export interface roleArgs {
  isAdmin?: boolean
  isAchiever?: boolean
  isSupporter?: boolean
  isSpectator?: boolean
  hasOpenRequestToJoin?: boolean
}

@Injectable({
  providedIn: 'root'
})
export class GoalStakeholderService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)
  private auth = inject(AuthService);

  converter: FirestoreDataConverter<GoalStakeholder | undefined> = {
    toFirestore: (payload: GoalStakeholder) => {
      const isUpdate = !!payload['uid'];
      const timestamp = serverTimestamp();
      const data = { ...payload } as DocumentData;

      if (!isUpdate) {
        data['createdAt'] = timestamp;
      }
      data['updatedAt'] = timestamp;
      data['updatedBy'] = this.auth.uid()

      return payload
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
      if (snapshot.exists()) {
        const data = snapshot.data(options);

        const dataWithId = {
          ...data,
          uid: snapshot.id,
        };

        return createGoalStakeholder(toDate(dataWithId))
      } else {
        return undefined
      }
    }
  }

  docData(stakeholderId: string, options: { goalId: string }) {
    const path = `Goals/${options.goalId}/GStakeholders/${stakeholderId}`
    const ref = doc(this.firestore, path).withConverter(this.converter)
    return docData(this.injector, ref)
  }

  collectionData(constraints: QueryConstraint[], options?: { goalId: string }): Observable<GoalStakeholder[]> {
    const path = `Goals/${options?.goalId}/GStakeholders`
    const ref = options?.goalId
      ? collection(this.firestore, path).withConverter(this.converter)
      : collectionGroup(this.firestore, 'GStakeholders').withConverter(this.converter)
    const q = query(ref, ...constraints)
    return collectionData(this.injector, q, { idField: 'uid' }) as Observable<GoalStakeholder[]>
  }

  getDoc(stakeholderId: string, params: { goalId: string }) {
    const docPath = `Goals/${params.goalId}/GStakeholders/${stakeholderId}`
    const docRef = doc(this.firestore, docPath).withConverter(this.converter)
    return getDoc(docRef).then(snapshot => snapshot.data())
  }

  async getDocs(constraints: QueryConstraint[], options: { goalId: string }): Promise<GoalStakeholder[]> {
    const colRef = collection(this.firestore, `Goals/${options.goalId}/GStakeholders`).withConverter(this.converter)
    const q = query(colRef, ...constraints)
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => d.data()).filter((s): s is GoalStakeholder => !!s)
  }

  async create(stakeholder: GoalStakeholder, params: { goalId: string }) {

    // 👇 goal is empty goal object in case this stakeholder is created when goal is created. All stakeholders that join after, should have goal defined
    const goal = await getDoc(doc(this.firestore, `Goals/${stakeholder.goalId}`)).then(snap => createGoal(snap.data()))

    stakeholder = createGoalStakeholder({
      ...stakeholder,
      goalPublicity: goal.publicity ? goal.publicity : stakeholder.goalPublicity,
      collectiveGoalId: goal.collectiveGoalId ?? ''
    })

    const colRef = collection(this.firestore, `Goals/${params.goalId}/GStakeholders`).withConverter(this.converter)
    return addDoc(colRef, stakeholder)
  }

  upsert(stakeholder: Partial<GoalStakeholder> & { uid: string }, options: { goalId: string }) {
    const docRef = doc(this.firestore, `Goals/${options.goalId}/GStakeholders/${stakeholder.uid}`).withConverter(this.converter)
    return setDoc(docRef, stakeholder as GoalStakeholder, { merge: true })
  }

  update(stakeholder: Partial<GoalStakeholder> & { uid: string }, options: { goalId: string }) {
    const docRef = doc(this.firestore, `Goals/${options.goalId}/GStakeholders/${stakeholder.uid}`).withConverter(this.converter)
    return setDoc(docRef, stakeholder as GoalStakeholder, { merge: true })
  }

  remove(uid: string, options: { goalId: string }) {
    const ref = doc(this.firestore, `Goals/${options.goalId}/GStakeholders/${uid}`)
    return deleteDoc(ref)
  }

  async updateLastCheckedGoal(goalId: string, uid: string) {
    const stakeholder = await this.getDoc(uid, { goalId })
    if (stakeholder) {
      this.update({
        uid,
        lastCheckedGoal: serverTimestamp() as any
      }, { goalId })
    }
  }

  async updateLastCheckedChat(goalId: string, uid: string) {
    const stakeholder = await this.getDoc(uid, { goalId })
    if (stakeholder) {
      this.update({
        uid,
        lastCheckedChat: serverTimestamp() as any
      }, { goalId })
    }
  }
}