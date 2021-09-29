import { Injectable } from '@angular/core';
import { Firestore, DocumentSnapshot, Query, QueryConstraint, where, orderBy, collectionGroup } from '@angular/fire/firestore';
// Rxjs
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Services
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { GoalStakeholderService } from '../../stakeholder/+state/stakeholder.service';
// Interfaces
import { Goal, createGoal } from './goal.firestore'
import { createGoalStakeholder, enumGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { UserService } from '@strive/user/user/+state/user.service';

@Injectable({ providedIn: 'root' })
export class GoalService extends FireCollection<Goal> {
  readonly path = `Goals`

  constructor(
    public db: Firestore,
    private stakeholder: GoalStakeholderService,
    private user: UserService
  ) { 
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Goal>) {
    return snapshot.exists()
      ? createGoal({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }

  protected toFirestore(goal: Goal): Goal {
    if (!!goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)
    goal.updatedBy = this.user.uid
    return goal
  }

  onCreate(goal: Goal, { write }: WriteOptions) {
    const stakeholder = createGoalStakeholder({
      uid: this.user.uid,
      goalId: goal.id,
      goalTitle: goal.title,
      goalImage: goal.image,
      goalPublicity: goal.publicity,
      isAdmin: true,
      isAchiever: true
    });
    return this.stakeholder.add(stakeholder, { write, params: { goalId: goal.id }})
  }

  getStakeholderGoals(uid: string, role: enumGoalStakeholder, publicOnly: boolean): Observable<Goal[]> {
    let constraints: QueryConstraint[];
    if (publicOnly) {
      constraints = [where('goalPublicity', '==', 'public'), where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('uid', '==', uid), where(role, '==', true), orderBy('createdAt', 'desc')]
    }

    return this.stakeholder.groupChanges(constraints).pipe(
      switchMap(stakeholders => {
        const goalIds = stakeholders.map(stakeholder => stakeholder.goalId)
        return this.valueChanges(goalIds)
      }),
      // Sort finished goals to the end
      map(goals => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1)),
    )
  }

  public finishGoal(goalId: string) {
    return this.update(goalId, { isFinished: true })
  }

  public updateDescription(goalId: string, description: string) {
    return this.update(goalId, { description })
  }

  public duplicateGoal(goal: Goal): Promise<string> {
    return this.add(createGoal(goal))
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
