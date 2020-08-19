import { Injectable } from '@angular/core';
// Angularfire
import { FirestoreService } from '../firestore/firestore.service';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { GoalStakeholderService } from './goal-stakeholder.service';
import { ImageService } from '../image/image.service';
// Interfaces
import { IGoal, EmptyGoal, enumGoalPublicity } from 'apps/journal/src/app/interfaces/goal.interface';
import { IMilestoneTemplabeObject } from 'apps/journal/src/app/interfaces/milestone.interface';

@Injectable({
  providedIn: 'root'
})
export class GoalService {

  constructor(
    private db: FirestoreService,
    private goalStakeholder: GoalStakeholderService,
    private imageService: ImageService,
  ) { }

  public getGoalDocObs(goalId: string): Observable<IGoal> {

    return this.db.docWithId$<IGoal>(`Goals/${goalId}`)
  
  }

  public async getGoal(goalId: string): Promise<IGoal> {

    return await this.getGoalDocObs(goalId).pipe(first()).toPromise()
  
  }

  public async toggleLock(goalId: string, lock: boolean) {

    await this.db.update<IGoal>(`Goals/${goalId}`, { isLocked: lock })

  }

  public async handleCreatingGoal(uid: string, goal: goalArgs, collectiveGoal?: collectiveGoalArgs): Promise<string>{
    
    const id = await this.db.getNewId()

    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)

    //Goal image
    if (!goal.image) goal.image = await this.imageService.uploadImage(`Goals/${id}/${id}`, false)

    //Set goal
    await this.setGoal(id, goal, collectiveGoal)

    //Add user as stakeholder
    await this.goalStakeholder.upsert(uid, id, {
      isAdmin: true,
      isAchiever: true
    })

    //Add user as achiever of collective goal
    // Firebase function handles this
    
    //Create initial chat
    // this.chatService.addInitialChat(id, goal.title, { goal: true })

    return id

  }

  public async handleUpdatingGoal(goal: IGoal): Promise<void> {

    const id = goal.id
    delete goal.id

    if (goal.deadline) goal.deadline = this.setDeadlineToEndOfDay(goal.deadline)

    //Goal image
    goal.image = await this.imageService.uploadImage(`Goals/${id}/${id}`, true)

    await this.db.upsert(`Goals/${id}`, goal)

  }

  public async finishGoal(goalId: string): Promise<void> {

    await this.db.upsert<IGoal>(`Goals/${goalId}`, {
      isFinished: true
    })

  }

  public async duplicateGoal(goal: IGoal): Promise<string> {

    const id = await this.db.getNewId()

    const goalArgs: goalArgs = {
      title: goal.title,
      description: goal.description,
      shortDescription: goal.shortDescription,
      image: goal.image,
      publicity: goal.publicity,
      deadline: goal.deadline,
      milestoneTemplateObject: goal.milestoneTemplateObject
    }

    let collectiveGoalArgs: collectiveGoalArgs
    if (goal.collectiveGoal) {
      collectiveGoalArgs = {
        id: goal.collectiveGoal.id,
        title: goal.collectiveGoal.title,
        isPublic: goal.collectiveGoal.isPublic,
        image: goal.collectiveGoal.image
      }
    }

    await this.setGoal(id, goalArgs, collectiveGoalArgs)  
    
    return id
  }

  private async setGoal(id: string, goal: goalArgs, collectiveGoal?: collectiveGoalArgs): Promise<void> {

    const newGoal = Object.assign({}, new EmptyGoal())

    Object.assign(newGoal, goal)

    if (collectiveGoal !== null && collectiveGoal.id !== null && collectiveGoal.title !== null){
      newGoal.collectiveGoal.id = collectiveGoal.id
      newGoal.collectiveGoal.title = collectiveGoal.title
      newGoal.collectiveGoal.image = collectiveGoal.image
      newGoal.collectiveGoal.isPublic == collectiveGoal.isPublic
    } else {
      delete newGoal.collectiveGoal
    }

    delete newGoal.id

    this.db.set(`Goals/${id}`, newGoal)
    
  }

  private setDeadlineToEndOfDay(deadline: string): string {

    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()

  }

}

export interface goalArgs {
  title: string;
  description?: string;
  shortDescription: string;
  publicity: enumGoalPublicity;
  deadline: string;
  image?: string;
  milestoneTemplateObject?: IMilestoneTemplabeObject[];
}

export interface collectiveGoalArgs {
  id: string
  title: string;
  isPublic: boolean;
  image: string;
  deadline?: string;
}
