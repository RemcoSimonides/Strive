import { Injectable } from '@angular/core';
import { Firestore, DocumentSnapshot, QueryConstraint, where, orderBy } from '@angular/fire/firestore';
// Rxjs
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Services
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { GoalStakeholderService } from '../stakeholder/stakeholder.service';
// Interfaces
import { Goal, createGoal, createGoalStakeholder, GoalStakeholder, GoalStakeholderRole } from '@strive/model'
import { UserService } from '@strive/user/user/user.service';
import { toDate } from '@strive/utils/helpers';

@Injectable({ providedIn: 'root' })
export class GoalService extends FireCollection<Goal> {
  readonly path = `Goals`

  constructor(
    public override db: Firestore,
    private stakeholder: GoalStakeholderService,
    private user: UserService
  ) { 
    super(db)
  }

  protected override fromFirestore(snapshot: DocumentSnapshot<Goal>) {
    return snapshot.exists()
      ? createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))
      : undefined
  }

  protected override toFirestore(goal: Goal): Goal {
    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)
    goal.updatedBy = this.user.uid
    return goal
  }

  override onCreate(goal: Goal, { write, params }: WriteOptions) {
    const uid = params?.['uid'] ?? this.user.uid;
    const stakeholder = createGoalStakeholder({
      uid,
      status: goal.status,
      goalId: goal.id,
      goalPublicity: goal.publicity,
      isAdmin: true,
      isAchiever: true
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

    return this.stakeholder.groupChanges(constraints).pipe(
      switchMap(stakeholders => {
        const goalIds = stakeholders.map(stakeholder => stakeholder.goalId)
        return combineLatest([
          of(stakeholders),
          this.valueChanges(goalIds)
        ]).pipe(
          map(([stakeholders, goals]) => {
            return stakeholders.map(stakeholder => ({
              stakeholder,
              goal: goals.find(goal => goal.id === stakeholder.goalId)!
            })).filter(result => !!result.goal)
          })
        )
      }),
      // Sort finished goals to the end
      map(result => result.sort((a, b) => {
        const order = ['active', 'bucketlist', 'finished']
        if (order.indexOf(a.stakeholder.status) > order.indexOf(b.stakeholder.status)) return 1
        if (order.indexOf(a.stakeholder.status) < order.indexOf(b.stakeholder.status)) return -1
        return 0
      })),
    )
  }

  public updateDescription(goalId: string, description: string) {
    return this.update(goalId, { description })
  }

  // public duplicateGoal(goal: Goal): Promise<string> {
  //   return this.add(createGoal(goal))
  // }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
