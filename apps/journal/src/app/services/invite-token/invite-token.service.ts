import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Services
import { GoalStakeholderService } from '../goal/goal-stakeholder.service';
import { CollectiveGoalStakeholderService } from '@strive/collective-goal/stakeholder/+state/stakeholder.service';
import { FirestoreService } from '../firestore/firestore.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Rxjs
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InviteTokenService {

  constructor(
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private goalStakeholderService: GoalStakeholderService,
    private route: ActivatedRoute,
    private user: UserService
    ) { }

  public async checkInviteToken(collection: 'goal' | 'collectiveGoal', id: string): Promise<boolean> {

    const { invite_token } = this.route.snapshot.queryParams;
    if (!invite_token) return false 

    let ref: string;
    if (collection === 'goal') {
      ref = `Goals/${id}/InviteTokens/${invite_token}`
    } else {
      ref = `CollectiveGoals/${id}/InviteTokens/${invite_token}`
    }

    const token = await this.db.docWithId$(ref).pipe(take(1)).toPromise()
    if (token) {
      const uid = this.user.uid
      if (!!uid) {

        if (collection === 'goal') {
          await this.goalStakeholderService.upsert(uid, id, { isSpectator: true })
        } else {
          await this.collectiveGoalStakeholderService.upsert(uid, id, { isSpectator: true })
        }

      }
    }

    return !!token
  }

  /**
   * @param id can be id of goal or collective goal
   */
  async getShareLink(id: string, isCollectiveGoal: boolean, isPublic: boolean, isAdmin: boolean): Promise<string> {

    const parsedUrl = new URL(window.location.href)

    if (isPublic) {
      return parsedUrl.href
    } else {

      if (isAdmin) {
        const token = await this.createInviteLink(id, isCollectiveGoal)
        return `${parsedUrl.href}?invite_token=${token}`
      } else return undefined

    }

  }

  async createInviteLink(id: string, isCollectiveGoal: boolean): Promise<string> {

    // TODO get servertimestamp instead of local time
    const now = new Date
    const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()).toISOString()

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    let ref: string
    if (isCollectiveGoal) ref = `CollectiveGoals/${id}/InviteTokens/${token}`
    if (!isCollectiveGoal) ref = `Goals/${id}/InviteTokens/${token}`

    await this.db.set(ref, {
      token: token,
      deadline: deadline
    })

    return token
  }
}
