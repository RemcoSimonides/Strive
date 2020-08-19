import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { FirestoreService } from '../firestore/firestore.service';
import { ImageService } from '../image/image.service';
// Interfaces
import { ITemplate } from 'apps/journal/src/app/interfaces/template.interface';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private db: FirestoreService,
    private imageService: ImageService,
  ) { }

  public getTemplateDocObs(collectiveGoalId: string, templateId: string): Observable<ITemplate> {

    return this.db.docWithId$<ITemplate>(`CollectiveGoals/${collectiveGoalId}/Templates/${templateId}`)

  }

  public async getTemplate(collectiveGoalId: string, templateId: string): Promise<ITemplate> {

    return await this.getTemplateDocObs(collectiveGoalId, templateId).pipe(first()).toPromise()

  }

  async increaseTimesUsed(collectiveGoalId: string, templateId: string, currentNumberOfTimesUsed?: number): Promise<void> {

    let plusOne: number
    if (currentNumberOfTimesUsed) {
      plusOne = currentNumberOfTimesUsed + 1
    } else {
      const template = await this.getTemplate(collectiveGoalId, templateId)
      plusOne = template.numberOfTimesUsed + 1
    }

    this.db.update(`CollectiveGoals/${collectiveGoalId}/Templates/${templateId}`, {
      numberOfTimesUsed: plusOne
    })

  }

  async createTemplate(collectiveGoalId: string, template: ITemplate): Promise<string> {

    const id = await this.db.getNewId()

    if (!template.milestoneTemplateObject) template.milestoneTemplateObject = []
    if (!template.numberOfTimesUsed) template.numberOfTimesUsed = 0
    if (!template.goalDeadline) template.goalDeadline = null
    
    if (template.goalDeadline) template.goalDeadline = this.setDeadlineToEndOfDay(template.goalDeadline)

    template.goalImage = await this.imageService.uploadImage(`CollectiveGoals/${collectiveGoalId}/Templates/${id}`, false)

    this.db.upsert(`CollectiveGoals/${collectiveGoalId}/Templates/${id}`, template)

    return id
  }

  async updateTemplate(collectiveGoalId: string, template: ITemplate): Promise<void> {

    if (!template.goalDeadline) template.goalDeadline = null
    if (template.goalDeadline) template.goalDeadline = this.setDeadlineToEndOfDay(template.goalDeadline)

    template.goalImage = await this.imageService.uploadImage(`CollectiveGoals/${collectiveGoalId}/Templates/${template.id}`, true)

    await this.db.upsert(`CollectiveGoals/${collectiveGoalId}/Templates/${template.id}`, template)

  }

  private setDeadlineToEndOfDay(deadline: string): string {

    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()

  }

}
