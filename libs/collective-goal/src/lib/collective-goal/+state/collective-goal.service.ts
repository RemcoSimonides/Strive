import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestore, DocumentSnapshot, QueryFn } from '@angular/fire/firestore';
// Services
import { FireCollection, WriteOptions } from '@strive/utils/services/collection.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
// Interfaces
import { CollectiveGoal, createCollectiveGoal } from './collective-goal.firestore';
import { map } from 'rxjs/operators';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { Observable } from 'rxjs';
import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalService extends FireCollection<CollectiveGoal> {
  readonly path = 'CollectiveGoals'

  constructor(
    public db: AngularFirestore,
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
    return collectiveGoal
  }

  onCreate(collectiveGoal: CollectiveGoal, { write }: WriteOptions) {
    const stakeholder = createCollectiveGoalStakeholder({
      uid: this.user.uid,
      collectiveGoalId: collectiveGoal.id,
      collectiveGoalIsPublic: collectiveGoal.isPublic,
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
    await this.db.doc(`CollectiveGoals/${collectiveGoalId}`).delete()
  }

  public getGoals(id: string, publicOnly: boolean): Observable<Goal[]> {
    let query: QueryFn
    if (publicOnly) {
      query = ref => ref.where('collectiveGoalId', '==', id).where('publicity', '==', 'public').orderBy('createdAt', 'desc')
    } else {
      query = ref => ref.where('collectiveGoalId', '==', id).where('publicity', '!=', 'private').orderBy('publicity').orderBy('createdAt', 'desc')
    }

    return this.goalService.valueChanges(query).pipe(
      map(goals => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1)),
    )
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
