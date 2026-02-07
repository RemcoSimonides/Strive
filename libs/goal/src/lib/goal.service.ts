import { Injectable, Injector, inject } from '@angular/core'
import { Firestore, addDoc, setDoc, deleteDoc } from '@angular/fire/firestore'
import { collection, doc, DocumentData, FirestoreDataConverter, getDoc, orderBy, QueryConstraint, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, where } from 'firebase/firestore'
import { docData, joinWith, toDate } from '@strive/utils/firebase'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { AuthService } from '@strive/auth/auth.service'

import { Goal, createGoal, createGoalStakeholder, GoalStakeholder, GoalStakeholderRole, StakeholderWithGoal } from '@strive/model'
import { getProgress } from './pipes/progress.pipe'
import { endOfDay } from 'date-fns'

@Injectable({ providedIn: 'root' })
export class GoalService {
  private firestore = inject(Firestore)
  private injector = inject(Injector)
  private auth = inject(AuthService);
  private stakeholder = inject(GoalStakeholderService);

  readonly path = `Goals`

  converter: FirestoreDataConverter<Goal | undefined> = {
    toFirestore: (payload: Goal) => {
      payload.deadline = endOfDay(payload.deadline)

      const isUpdate = !!payload['id'];
      const timestamp = serverTimestamp();
      const data = { ...payload } as DocumentData;

      if (!isUpdate) {
        data['createdAt'] = timestamp;
      }
      data['updatedAt'] = timestamp;
      data['updatedBy'] = this.auth.uid()

      delete data['id'];
      return payload
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
      if (snapshot.exists()) {
        const data = snapshot.data(options);

        const dataWithId = {
          ...data,
          id: snapshot.id,
        };

        return createGoal(toDate(dataWithId))
      } else {
        return undefined
      }
    }
  }

  update(id: string, goal: Partial<Goal>) {
    const docRef = doc(this.firestore, `Goals/${id}`).withConverter(this.converter)
    return setDoc(docRef, goal, { merge: true })
  }

  async create(goal: Goal) {
    if (!goal.id) throw new Error('Goal id must already be defined to create stakeholder too')

    const stakeholder = createGoalStakeholder({
      uid: this.auth.uid(),
      goalId: goal.id,
      goalPublicity: goal.publicity,
      isAdmin: true,
      isAchiever: true,
      isSpectator: true
    })

    await this.stakeholder.create(stakeholder, { goalId: goal.id })

    const colRef = collection(this.firestore, 'Goals').withConverter(this.converter)
    return addDoc(colRef, goal)
  }

  remove(id: string) {
    const ref = doc(this.firestore, `Goals/${id}`)
    return deleteDoc(ref)
  }

  createId() {
    return doc(collection(this.firestore, `Goals`)).id
  }

  docData(id: string): Observable<Goal | undefined>  {
    const docPath = `Goals/${id}`
    const docRef = doc(this.firestore, docPath).withConverter(this.converter)
    return docData(this.injector, docRef)
  }

  async getDoc(id: string): Promise<Goal | undefined> {
    const docRef = doc(this.firestore, `Goals/${id}`).withConverter(this.converter)
    const snapshot = await getDoc(docRef)
    return snapshot.data()
  }

  getStakeholderGoals(uid: string, role: GoalStakeholderRole, publicOnly: boolean): Observable<StakeholderWithGoal[]> {
    let constraints: QueryConstraint[]
    if (publicOnly) {
      constraints = [where('goalPublicity', '==', 'public'), where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    }

    return this.stakeholder.collectionData(constraints).pipe(
      joinWith({
        goal: (stakeholder: GoalStakeholder) => this.docData(stakeholder.goalId)
      }, { shouldAwait: true }),
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal)), // <-- in case a goal is being removed
      // Sort finished goals to the end
      map(result => result.sort((first, second)  => {
        if (!first.goal || !second.goal) return 0

        // Sort finished goals to the end and in progress goals to top
        const a = getProgress(first.goal)
        const b = getProgress(second.goal)

        if (a === 1 || b === 1) {
          // Progress of 1 means the goal is finished
          if (a === b) return 0
          if (a === 1) return 1
          if (b === 1) return -1
        }

        // Sort by priority if priority has been set on any goals
        if (first.priority !== -1 || second.priority !== -1) {
          if (first.priority === second.priority) return 0
          if (first.priority === -1) return 1
          if (second.priority === -1) return -1
          return first.priority < second.priority ? -1 : 1
        }

        if (a === b) return 0
        if (b === 1) return -1
        if (a === 1) return 1

        if (a > b) return -1
        if (a < b) return 1
        return 0
      }))
    ) as Observable<StakeholderWithGoal[]>
  }

  public updateDescription(goalId: string, description: string) {
    return this.update(goalId, { description })
  }
}
