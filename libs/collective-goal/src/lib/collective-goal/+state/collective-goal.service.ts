import { Injectable } from '@angular/core';
// Angularfire
import { QueryFn } from '@angular/fire/firestore';
// Rxjs
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { ImageService } from '@strive/media/+state/image.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { ICollectiveGoal } from './collective-goal.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalService {

  constructor(
    // private chatService: ChatService,
    private user: UserService,
    private db: FirestoreService,
    private imageService: ImageService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService
  ) { }

  public getCollectiveGoalDocObs(collectiveGoalId: string): Observable<ICollectiveGoal> {

    return this.db.docWithId$<ICollectiveGoal>(`CollectiveGoals/${collectiveGoalId}`)

  }

  public async getCollectiveGoal(collectiveGoalId: string): Promise<ICollectiveGoal> {

    return await this.getCollectiveGoalDocObs(collectiveGoalId).pipe(first()).toPromise()

  }


  /**
   * @returns returns the id of the newly created collectiveGoal document
   * @param collectiveGoal Data of the Collective Goal
   * @param image Optional image blob
   */
  public async createCollectiveGoal(collectiveGoal: ICollectiveGoal): Promise<string> {
    
    //Create new id for collective goal
    const id = await this.db.getNewId();
    
    if (collectiveGoal.deadline) collectiveGoal.deadline = this.setDeadlineToEndOfDay(collectiveGoal.deadline)

    //Handle image
    collectiveGoal.image = await this.imageService.uploadImage(`CollectiveGoals/${id}/${id}`, false)

    //Set Collective Goal
    await this.upsertCollectiveGoal(collectiveGoal, id)

    //Add User as Stakeholder
    await this.collectiveGoalStakeholderService.upsert(this.user.uid, id, { isAdmin: true })

    //Create initial chat
    // this.chatService.addInitialChat(id, collectiveGoal.title, { collectiveGoal: true })

    return id
  }

  /**
   * Does everything needed to update a collectivegoal
   * @param collectiveGoal Data of the changed collective goal
   * @param image Optional image blob
   */
  public async updateCollectiveGoal(id: string, collectiveGoal: ICollectiveGoal): Promise<void> {

    if (collectiveGoal.deadline) collectiveGoal.deadline = this.setDeadlineToEndOfDay(collectiveGoal.deadline)

    //Handle image
    // collectiveGoal.image = await this.imageService.uploadImage(`CollectiveGoals/${id}/${id}`, true)
    
    await this.db.upsert(`CollectiveGoals/${id}`, collectiveGoal)
  }

  public async delete(collectiveGoalId: string): Promise<void> {
    await this.db.doc(`CollectiveGoals/${collectiveGoalId}`).delete()
  }

  public getGoals(id: string, publicOnly: boolean): Observable<Goal[]> {
    let query: QueryFn
    if (publicOnly) {
      query = ref => ref.where('collectiveGoal.id', '==', id).where('publicity', '==', 'public').orderBy('createdAt', 'desc')
    } else {
      query = ref => ref.where('collectiveGoal.id', '==', id).where('publicity', 'in', ['collectiveGoalOnly', 'public']).orderBy('createdAt', 'desc')
    }

    return this.db.colWithIds$<Goal[]>(`Goals`, query).pipe(
      map((goals:Goal[]) => goals.sort((a, b) => a.isFinished === b.isFinished ? 0 : a.isFinished ? 1 : -1)),
    )
  }

  private async upsertCollectiveGoal(collectiveGoal: ICollectiveGoal, id: string): Promise<void> {
    await this.db.upsert(`CollectiveGoals/${id}`, collectiveGoal)
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
