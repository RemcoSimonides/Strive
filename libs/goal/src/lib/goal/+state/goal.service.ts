import { Injectable } from '@angular/core';
// Angularfire
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { GoalStakeholderService } from '../../stakeholder/+state/stakeholder.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
// Interfaces
import { IMilestoneTemplabeObject } from '@strive/interfaces';
import { Goal, createGoal } from './goal.firestore'

// export interface goalArgs {
//   title: string;
//   description?: string;
//   shortDescription: string;
//   publicity: enumGoalPublicity;
//   deadline: string;
//   image?: string;
//   milestoneTemplateObject?: IMilestoneTemplabeObject[];
// }

export interface collectiveGoalArgs {
  id: string
  title: string;
  isPublic: boolean;
  image: string;
  deadline?: string;
}

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

  public async handleCreatingGoal(uid: string, goal: Partial<Goal>, collectiveGoal?: collectiveGoalArgs): Promise<string>{
    
    const id = await this.db.getNewId()

    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)

    //Goal image
    if (!goal.image) goal.image = await this.imageService.uploadImage(`Goals/${id}/${id}`, false)

    //Set goal
    await this.setGoal(id, goal)

    //Add user as stakeholder
    await this.stakeholder.upsert(uid, id, {
      isAdmin: true,
      isAchiever: true
    })

    //Add user as achiever of collective goal
    // Firebase function handles this
    
    //Create initial chat
    // this.chatService.addInitialChat(id, goal.title, { goal: true })

    return id

  }

  public async handleUpdatingGoal(goal: Goal): Promise<void> {

    const id = goal.id
    delete goal.id

    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)

    //Goal image
    goal.image = await this.imageService.uploadImage(`Goals/${id}/${id}`, true)

    await this.db.upsert(`Goals/${id}`, goal)

  }

  public async upsert(goalId: string, goal: Partial<Goal>) {
    await this.db.upsert<Goal>(`Goals/${goalId}`, goal)
  }

  public async delete(goalId: string): Promise<void> {
    await this.db.doc(`Goals/${goalId}`).delete()
  }

  public async finishGoal(goalId: string): Promise<void> {
    await this.db.upsert<Goal>(`Goals/${goalId}`, {
      isFinished: true
    })
  }

  public async duplicateGoal(goal: Goal): Promise<string> {

    const id = await this.db.getNewId()

    // const goalArgs: goalArgs = {
    //   title: goal.title,
    //   description: goal.description,
    //   shortDescription: goal.shortDescription,
    //   image: goal.image,
    //   publicity: goal.publicity,
    //   deadline: goal.deadline,
    //   milestoneTemplateObject: goal.milestoneTemplateObject
    // }

    // let collectiveGoalArgs: collectiveGoalArgs
    // if (goal.collectiveGoal) {
    //   collectiveGoalArgs = {
    //     id: goal.collectiveGoal.id,
    //     title: goal.collectiveGoal.title,
    //     isPublic: goal.collectiveGoal.isPublic,
    //     image: goal.collectiveGoal.image
    //   }
    // }

    await this.setGoal(id, goal)
    
    return id
  }

  private async setGoal(id: string, goal: Partial<Goal>): Promise<void> {

    const newGoal = createGoal(goal);

    // Object.assign(newGoal, goal)

    // if (collectiveGoal !== null && collectiveGoal.id !== null && collectiveGoal.title !== null){
    //   newGoal.collectiveGoal.id = collectiveGoal.id
    //   newGoal.collectiveGoal.title = collectiveGoal.title
    //   newGoal.collectiveGoal.image = collectiveGoal.image
    //   newGoal.collectiveGoal.isPublic == collectiveGoal.isPublic
    // } else {
    //   delete newGoal.collectiveGoal
    // }

    // delete newGoal.id

    console.log('new Goal: ', newGoal);

    // this.db.set(`Goals/${id}`, newGoal)
    
  }

  private setDeadlineToEndOfDay(deadline: string): string {

    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()

  }

}
