import { Injectable } from '@angular/core';
// Angularfire
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { GoalStakeholderService } from '../../stakeholder/+state/stakeholder.service';
import { ImageService } from '@strive/media/+state/image.service';
// Interfaces
import { Goal, createGoal } from './goal.firestore'

@Injectable({ providedIn: 'root' })
export class GoalService {

  constructor(
    private db: FirestoreService,
    private stakeholder: GoalStakeholderService,
    private imageService: ImageService,
  ) { }

  public getGoalDocObs(goalId: string): Observable<Goal> {
    return this.db.docWithId$<Goal>(`Goals/${goalId}`)
  }

  public async getGoal(goalId: string): Promise<Goal> {
    return await this.getGoalDocObs(goalId).pipe(first()).toPromise()
  }

  public async toggleLock(goalId: string, lock: boolean) {
    await this.db.update<Goal>(`Goals/${goalId}`, { isLocked: lock })
  }

  public async create(uid: string, goal: Partial<Goal>): Promise<string> {
    const id = await this.db.getNewId()

    if (!!goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)

    //Goal image
    // if (!goal.image) goal.image = await this.imageService.uploadImage(`Goals/${id}/${id}`, false)

    //Set goal
    await this.db.doc(`Goals/${id}`).set(createGoal({ ...goal, id }))

    //Add user as stakeholder
    await this.stakeholder.upsert(uid, id, {
      isAdmin: true,
      isAchiever: true
    })

    // Add user as achiever of collective goal
    // Firebase function handles this
    
    // Create initial chat
    // this.chatService.addInitialChat(id, goal.title, { goal: true })

    return id
  }

  public async update(goalId: string, goal: Goal) {
    if (!!goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)

    //Goal image
    // goal.image = await this.imageService.uploadImage(`Goals/${id}/${id}`, true)

    await this.upsert(goalId, createGoal(goal))
  }

  private async upsert(goalId: string, goal: Partial<Goal>) {
    await this.db.upsert<Goal>(`Goals/${goalId}`, goal)
  }

  public async delete(goalId: string) {
    await this.db.doc(`Goals/${goalId}`).delete()
  }

  public async finishGoal(goalId: string) {
    await this.upsert(goalId, { isFinished: true })
  }

  public async updateDescription(goalId: string, description: string) {
    await this.upsert(goalId, { description })
  }

  public async duplicateGoal(goal: Goal): Promise<string> {
    const ref = await this.db.col(`Goals`).add(createGoal(goal))
    return ref.id
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
