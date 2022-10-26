import { Injectable } from '@angular/core'
import { DocumentSnapshot, orderBy, QueryConstraint, serverTimestamp, where } from 'firebase/firestore'
import { toDate, FireCollection, WriteOptions, joinWith } from 'ngfire'

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { GoalStakeholderService } from '../stakeholder/stakeholder.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { Goal, createGoal, createGoalStakeholder, GoalStakeholder, GoalStakeholderRole, StakeholderWithGoal } from '@strive/model'
import { getProgress } from './pipes/progress.pipe'

@Injectable({ providedIn: 'root' })
export class GoalService extends FireCollection<Goal> {
  readonly path = `Goals`
  override readonly memorize = true

  constructor(
    private auth: AuthService,
    private stakeholder: GoalStakeholderService
  ) { 
    super()
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Goal>) {
    return snapshot.exists()
      ? createGoal(toDate({ ...snapshot.data(), [this.idKey]: snapshot.id }))
      : undefined
  }

  protected override toFirestore(goal: Goal, actionType: 'add' | 'update'): Goal {
    const timestamp = serverTimestamp() as any

    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)
    if (goal.isFinished === true) goal.isFinished = timestamp
    if (actionType === 'add') goal.createdAt = timestamp

    goal.updatedBy = this.auth.uid
    goal.updatedAt = timestamp

    return goal
  }

  override onCreate(goal: Goal, { write, params }: WriteOptions) {
    const uid = params?.['uid'] ?? this.auth.uid
    const stakeholder = createGoalStakeholder({
      uid,
      goalId: goal.id,
      goalPublicity: goal.publicity,
      isAdmin: true,
      isAchiever: true,
      isSpectator: true
    });
    return this.stakeholder.add(stakeholder, { write, params: { goalId: goal.id }})
  }

  getStakeholderGoals(uid: string, role: GoalStakeholderRole, publicOnly: boolean): Observable<StakeholderWithGoal[]> {
    let constraints: QueryConstraint[]
    if (publicOnly) {
      constraints = [where('goalPublicity', '==', 'public'), where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    }

    return this.stakeholder.valueChanges(constraints).pipe(
      joinWith({
        goal: (stakeholder: GoalStakeholder) => this.valueChanges(stakeholder.goalId)
      }, { shouldAwait: true }),
      // Sort finished goals to the end
      map(result => result.sort((first, second)  => {
        if (!first.goal || !second.goal) return 0

        // Sort finished goals to the end and in progress goals to top
        const a = getProgress(first.goal)
        const b = getProgress(second.goal)

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

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
