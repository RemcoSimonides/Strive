import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { doc, getDoc, setDoc, Firestore, DocumentSnapshot } from '@angular/fire/firestore';
// Services
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
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
    private goalStakeholderService: GoalStakeholderService,
    private route: ActivatedRoute,
    private user: UserService
    ) { }

  public async checkInviteToken(id: string): Promise<boolean> {
    const { invite_token } = this.route.snapshot.queryParams
    if (!invite_token) return false

    const ref = `Goals/${id}/InviteTokens/${invite_token}`

    const snap = await getDoc(doc(this.db, ref)) as DocumentSnapshot<InviteToken>
    const { token } = snap.data()

    if (token) {
      const uid = this.user.uid
      if (uid) {
        await this.goalStakeholderService.upsert({ uid, isSpectator: true }, { params: { goalId: id }})
      }
    }

    return true
  }

  /**
   * @param {string} path override current page url with the url you'd like
   */
  async getShareLink(goalId: string, isSecret: boolean, isAdmin: boolean, path?: string): Promise<string> {
    const { href, origin } = new URL(window.location.href)
    const url = path ? `${origin}/${path}` : href

    if (isSecret) {
      if (isAdmin) {
        const token = await this.createInviteLink(goalId)
        return `${url}?invite_token=${token}`
      } else return undefined
    } else {
      return url
    }
  }

  async createInviteLink(id: string): Promise<string> {
    const now = new Date
    const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds()).toISOString()

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const data: InviteToken = { token, deadline }

    const ref = `Goals/${id}/InviteTokens/${token}`
    await setDoc(doc(this.db, ref), data) 

    return token
  }
}
