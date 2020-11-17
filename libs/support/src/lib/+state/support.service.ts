import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
// Interfaces
import { SupportStatus, NotificationSupport } from '@strive/support/+state/support.firestore';
import { Support } from '@strive/support/+state/support.firestore';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(
    private db: FirestoreService,
  ) { }

  async changeSupportStatus(goalId: string, supportId: string, status: SupportStatus): Promise<void> {
    this.db.upsert(`Goals/${goalId}/Supports/${supportId}`, {
      status: status
    })
  }

  async changeSupportStatusDependantOnDecision(goalId: string, supports: NotificationSupport[]): Promise<void> {
    supports.forEach(support => {
      if (support.decision === 'give') {
        this.changeSupportStatus(goalId, support.id, 'waiting_for_receiver')
      } else if (support.decision === 'keep') {
        this.changeSupportStatus(goalId, support.id, 'rejected')
      }  
    })
  }

  addSupport(goalId: string, support: Support) {
    this.db.add(`Goals/${goalId}/Supports`, support)
  }
}
