import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { AuthService } from '../auth/auth.service';
import { FirestoreService } from '../firestore/firestore.service';
import { CollectiveGoalStakeholderService } from './collective-goal-stakeholder.service';
import { ImageService } from '../image/image.service';
// Interfaces
import { ICollectiveGoal } from 'apps/journal/src/app/interfaces/collective-goal.interface';

@Injectable({
  providedIn: 'root'
})
export class CollectiveGoalService {

  constructor(
    // private chatService: ChatService,
    private authService: AuthService,
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
  public async handleCreatingCollectiveGoal(collectiveGoal: ICollectiveGoal): Promise<string> {
    
    //Create new id for collective goal
    const id = await this.db.getNewId();
    const uid = (await this.authService.afAuth.currentUser).uid;
    
    if (collectiveGoal.deadline) collectiveGoal.deadline = this.setDeadlineToEndOfDay(collectiveGoal.deadline)

    //Handle image
    collectiveGoal.image = await this.imageService.uploadImage(`CollectiveGoals/${id}/${id}`, false)

    //Set Collective Goal
    await this.setCollectiveGoal(collectiveGoal, id)

    //Add User as Stakeholder
    await this.collectiveGoalStakeholderService.upsert(uid, id, { isAdmin: true })

    //Create initial chat
    // this.chatService.addInitialChat(id, collectiveGoal.title, { collectiveGoal: true })

    return id
  }

  /**
   * Does everything needed to update a collectivegoal
   * @param collectiveGoal Data of the changed collective goal
   * @param image Optional image blob
   */
  public async handleUpdatingCollectiveGoal(collectiveGoal: ICollectiveGoal): Promise<void> {

    const id = collectiveGoal.id

    if (collectiveGoal.deadline) collectiveGoal.deadline = this.setDeadlineToEndOfDay(collectiveGoal.deadline)

    //Handle image
    collectiveGoal.image = await this.imageService.uploadImage(`CollectiveGoals/${id}/${id}`, true)

    delete collectiveGoal.id
    
    await this.db.upsert(`CollectiveGoals/${id}`, collectiveGoal)
  }

  public async delete(collectiveGoalId: string): Promise<void> {

    await this.db.doc(`CollectiveGoals/${collectiveGoalId}`).delete()

  }

  private async setCollectiveGoal(collectiveGoal: ICollectiveGoal, id: string): Promise<void> {
    await this.db.set(`CollectiveGoals/${id}`, collectiveGoal)
  }

  private setDeadlineToEndOfDay(deadline: string): string {

    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()

  }

}
