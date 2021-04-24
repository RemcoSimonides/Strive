import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from '@strive/utils/services/firestore.service';
// Interfaces
import { SupportStatus, NotificationSupport, createSupport } from '@strive/support/+state/support.firestore';
import { Support } from '@strive/support/+state/support.firestore';
import { take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SupportService {

  constructor(private db: FirestoreService) { }

  async get(goalId: string, supportId: string) {
    const support = await this.db.doc$(`Goals/${goalId}/Supports/${supportId}`).pipe(take(1)).toPromise()
    return createSupport(support)
  }

  async changeSupportStatus(goalId: string, supportId: string, status: SupportStatus): Promise<void> {
    this.db.upsert(`Goals/${goalId}/Supports/${supportId}`, { status })
  }

  async changeSupportStatusDependantOnDecision(goalId: string, supports: NotificationSupport[]): Promise<void> {
    supports.forEach(support => {
      if (support.decision === 'give') {
        this.changeSupportStatus(goalId, support.id, 'waiting_to_be_paid')
      } else if (support.decision === 'keep') {
        this.changeSupportStatus(goalId, support.id, 'rejected')
      }  
    })
  }

  addSupport(goalId: string, support: Support) {
    this.db.add(`Goals/${goalId}/Supports`, support)
  }

  async upsert(goalId: string, supportId: string, data: Partial<Support>) {
    this.db.upsert(`Goals/${goalId}/Supports/${supportId}`, data)
  }
}
