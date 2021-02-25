import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
import { ImageService } from '@strive/media/+state/image.service';
// Interfaces
import { Template } from '@strive/template/+state/template.firestore'

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(
    private db: FirestoreService,
    private imageService: ImageService,
  ) { }

  public getTemplate$(collectiveGoalId: string, templateId: string): Observable<Template> {
    return this.db.docWithId$<Template>(`CollectiveGoals/${collectiveGoalId}/Templates/${templateId}`)
  }

  public async getTemplate(collectiveGoalId: string, templateId: string): Promise<Template> {
    return await this.getTemplate$(collectiveGoalId, templateId).pipe(first()).toPromise()
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

  async createTemplate(collectiveGoalId: string, template: Template): Promise<string> {

    const id = await this.db.getNewId()

    if (!template.milestoneTemplateObject) template.milestoneTemplateObject = []
    if (!template.numberOfTimesUsed) template.numberOfTimesUsed = 0
    if (!template.goalDeadline) template.goalDeadline = null
    
    if (template.goalDeadline) template.goalDeadline = this.setDeadlineToEndOfDay(template.goalDeadline)

    template.goalImage = await this.imageService.uploadImage(`CollectiveGoals/${collectiveGoalId}/Templates/${id}`, false)

    this.db.upsert(`CollectiveGoals/${collectiveGoalId}/Templates/${id}`, template)

    return id
  }

  async updateTemplate(collectiveGoalId: string, template: Template): Promise<void> {

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
