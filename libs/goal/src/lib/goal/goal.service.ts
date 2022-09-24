import { Injectable } from '@angular/core'
import { DocumentSnapshot, orderBy, QueryConstraint, serverTimestamp, where } from 'firebase/firestore'
import { toDate, FireCollection, WriteOptions } from 'ngfire'

import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { GoalStakeholderService } from '../stakeholder/stakeholder.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { Goal, createGoal, createGoalStakeholder, GoalStakeholder, GoalStakeholderRole } from '@strive/model'
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
      ? createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }

  protected override toFirestore(goal: Goal): Goal {
    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)
    if (goal.isFinished === true) goal.isFinished = serverTimestamp() as any
    goal.updatedBy = this.auth.uid
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

  getStakeholderGoals(uid: string, role: GoalStakeholderRole, publicOnly: boolean): Observable<{ goal: Goal, stakeholder: GoalStakeholder }[]> {
    let constraints: QueryConstraint[];
    if (publicOnly) {
      constraints = [where('goalPublicity', '==', 'public'), where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    }

    return this.stakeholder.valueChanges(constraints).pipe(
      switchMap(stakeholders => {
        const goalIds = stakeholders.map(stakeholder => stakeholder.goalId)
        return combineLatest([
          of(stakeholders),
          this.valueChanges(goalIds)
        ]).pipe(
          map(([stakeholders, goals]) => {
            return stakeholders.map(stakeholder => ({
              stakeholder,
              goal: goals.find(goal => goal.id === stakeholder.goalId) as Goal
            })).filter(result => !!result.goal)
          })
        )
      }),
      // Sort finished goals to the end
      map(result => result.sort((first, second)  => {
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
    )
  }

  public updateDescription(goalId: string, description: string) {
    return this.update(goalId, { description })
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
