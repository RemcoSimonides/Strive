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

  async create(collectiveGoalId: string, template: Template): Promise<string> {
    const id = await this.db.getNewId()
    template.id = id;
    if (!!template.goalDeadline) template.goalDeadline = this.setDeadlineToEndOfDay(template.goalDeadline)

    // template.goalImage = await this.imageService.uploadImage(`CollectiveGoals/${collectiveGoalId}/Templates/${id}`, false)

    await this.db.upsert(`CollectiveGoals/${collectiveGoalId}/Templates/${id}`, template)

    return id
  }

  async update(collectiveGoalId: string, templateId: string, template: Template) {
    if (template.goalDeadline) template.goalDeadline = this.setDeadlineToEndOfDay(template.goalDeadline)

    // template.goalImage = await this.imageService.uploadImage(`CollectiveGoals/${collectiveGoalId}/Templates/${template.id}`, true)

    await this.db.upsert(`CollectiveGoals/${collectiveGoalId}/Templates/${templateId}`, template)
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
