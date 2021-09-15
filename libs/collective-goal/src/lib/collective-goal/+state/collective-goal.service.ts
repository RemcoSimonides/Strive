import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Angularfire
import { Firestore, DocumentSnapshot, doc, deleteDoc, QueryConstraint, where, orderBy } from '@angular/fire/firestore';
// Services
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
// Interfaces
import { CollectiveGoal, createCollectiveGoal } from './collective-goal.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalService extends FireCollection<CollectiveGoal> {
  readonly path = 'CollectiveGoals'

  constructor(
    public db: Firestore,
    private goalService: GoalService,
    private user: UserService,
    private stakeholder: CollectiveGoalStakeholderService
  ) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<CollectiveGoal>) {
    return snapshot.exists
      ? createCollectiveGoal({ ...snapshot.data(), id: snapshot.id })
      : undefined
  }

  protected toFirestore(collectiveGoal: CollectiveGoal): CollectiveGoal {
    if (!!collectiveGoal.deadline) collectiveGoal.deadline = this.setDeadlineToEndOfDay(collectiveGoal.deadline)
    collectiveGoal.updatedBy = this.user.uid
    return collectiveGoal
  }

  onCreate(collectiveGoal: CollectiveGoal, { write }: WriteOptions) {
    const stakeholder = createCollectiveGoalStakeholder({
      uid: this.user.uid,
      collectiveGoalId: collectiveGoal.id,
      collectiveGoalIsSecret: collectiveGoal.isSecret,
      collectiveGoalTitle: collectiveGoal.title,
      isAdmin: true
    })
    return this.stakeholder.add(stakeholder, { write, params: { collectiveGoalId: collectiveGoal.id }})
  }

  /**
   * Does everything needed to update a collectivegoal
   * @param collectiveGoal Data of the changed collective goal
   * @param image Optional image blob
   */
  public async updateCollectiveGoal(id: string, collectiveGoal: CollectiveGoal) {

    if (collectiveGoal.deadline) collectiveGoal.deadline = this.setDeadlineToEndOfDay(collectiveGoal.deadline)

    //Handle image
    // collectiveGoal.image = await this.imageService.uploadImage(`CollectiveGoals/${id}/${id}`, true)
    
    await this.upsert(collectiveGoal)
  }

  public async delete(collectiveGoalId: string) {
    await deleteDoc(doc(this.db, `CollectiveGoals/${collectiveGoalId}`))
  }

  public getGoals(id: string, secret: boolean): Observable<Goal[]> {
    let constraints: QueryConstraint[]
    if (secret) {
      constraints = [where('collectiveGoalId', '==', id), where('publicity', '!=', 'private'), orderBy('publicity'), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('collectiveGoalId', '==', id), where('publicity', '==', 'public'), orderBy('createdAt', 'desc')]
    }

    return this.goalService.valueChanges(constraints).pipe(
      map(goals => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1)),
    )
  }

  getCollectiveGoalsOfStakeholder(uid: string, isSecret?: boolean): Observable<CollectiveGoal[]> {
    let constraints: QueryConstraint[]
    if (isSecret !== undefined) {
      constraints = [where('uid', '==', uid), where('collectiveGoalIsSecret', '==', isSecret), orderBy('createdAt', 'desc')]
    } else {
      constraints = [where('uid', '==', uid), orderBy('createdAt', 'desc')]
    }

    return this.stakeholder.groupChanges(constraints).pipe(
      switchMap(stakeholders => {
        const ids = stakeholders.map(stakeholder => stakeholder.collectiveGoalId)
        const observables = ids.map(id => this.valueChanges(id))
        return observables.length ? combineLatest(observables) : of([])
      })
    )
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
