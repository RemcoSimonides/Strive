import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { doc, getDoc, setDoc, Firestore, DocumentSnapshot } from '@angular/fire/firestore';
// Services
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';

export interface InviteToken {
  token: string;
  deadline: string;
}

@Injectable({
  providedIn: 'root'
})
export class InviteTokenService {

  constructor(
    private db: Firestore,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private goalStakeholderService: GoalStakeholderService,
    private route: ActivatedRoute,
    private user: UserService
    ) { }

  public async checkInviteToken(collection: 'goal' | 'collectiveGoal', id: string): Promise<boolean> {

    const { invite_token } = this.route.snapshot.queryParams;
    if (!invite_token) return false 

    const ref = collection === 'goal'
      ? `Goals/${id}/InviteTokens/${invite_token}`
      : `CollectiveGoals/${id}/InviteTokens/${invite_token}`

    const snap = await getDoc(doc(this.db, ref)) as DocumentSnapshot<InviteToken>
    const { token } = snap.data()

    if (token) {
      const uid = this.user.uid
      if (uid) {

        if (collection === 'goal') {
          await this.goalStakeholderService.upsert({ uid, isSpectator: true }, { params: { goalId: id }})
        } else {
          await this.collectiveGoalStakeholderService.upsert({ uid, isSpectator: true }, { params: { collectiveGoalId: id }})
        }

      }
    }

    return !!token
  }

  /**
   * @param id can be id of goal or collective goal
   */
  async getShareLink(id: string, isCollectiveGoal: boolean, isSecret: boolean, isAdmin: boolean): Promise<string> {

    const parsedUrl = new URL(window.location.href)

    if (isSecret) {
      if (isAdmin) {
        const token = await this.createInviteLink(id, isCollectiveGoal)
        return `${parsedUrl.href}?invite_token=${token}`
      } else return undefined
    } else {
      return parsedUrl.href
    }

  }

  async createInviteLink(id: string, isCollectiveGoal: boolean): Promise<string> {

    const now = new Date
    const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()).toISOString()

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const ref = isCollectiveGoal
      ? `CollectiveGoals/${id}/InviteTokens/${token}`
      : `Goals/${id}/InviteTokens/${token}`

    const data: InviteToken = { token, deadline }

    await setDoc(doc(this.db, ref), data) 

    return token
  }
}
