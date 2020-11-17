import { Injectable } from '@angular/core';
// Services
import { FirestoreService } from '../firestore/firestore.service';
// Interfaces
import {
  enumSupportStatus,
  enumSupportDecision,
  INotificationSupport
} from '@strive/interfaces';
import { Support } from '@strive/support/+state/support.firestore';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor(
    private db: FirestoreService,
  ) { }

  async changeSupportStatus(goalId: string, supportId: string, status: enumSupportStatus): Promise<void> {
    this.db.upsert(`Goals/${goalId}/Supports/${supportId}`, {
      status: status
    })
  }

  async changeSupportStatusDependantOnDecision(goalId: string, supports: INotificationSupport[]): Promise<void> {
    supports.forEach(support => {
      if (support.decision === enumSupportDecision.give) {
        this.changeSupportStatus(goalId, support.id, enumSupportStatus.waiting_for_receiver)
      } else if (support.decision === enumSupportDecision.keep) {
        this.changeSupportStatus(goalId, support.id, enumSupportStatus.rejected)
      }  
    })
  }

  addSupport(goalId: string, support: Support) {
    this.db.add(`Goals/${goalId}/Supports`, support)
  }
}

