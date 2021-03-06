import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
// Services
import { FireCollection } from '@strive/utils/services/collection.service';
// Interfaces
import { Template } from '@strive/template/+state/template.firestore'

@Injectable({
  providedIn: 'root'
})
export class TemplateService extends FireCollection<Template> {
  readonly path = 'CollectiveGoals/:collectiveGoalId/Templates'

  constructor(public db: AngularFirestore) {
    super(db)
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Template>) {
    return (snapshot.exists)
      ? { ...snapshot.data(), id: snapshot.id, path: snapshot.ref.path }
      : undefined
  }

  protected toFirestore(template: Template): Template {
    if (!!template.goalDeadline) template.goalDeadline = this.setDeadlineToEndOfDay(template.goalDeadline)
    return template
  }

  private setDeadlineToEndOfDay(deadline: string): string {
    const date = new Date(deadline)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString()
  }
}
