import { Injectable } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { doc, DocumentSnapshot, getDoc, getFirestore, setDoc } from 'firebase/firestore'


export interface InviteToken {
  token: string
  deadline: string
}

@Injectable({
  providedIn: 'root'
})
export class InviteTokenService {

  constructor(private route: ActivatedRoute) { }

  public async checkInviteToken(id: string): Promise<boolean> {
    const { invite_token } = this.route.snapshot.queryParams
    if (!invite_token) return false

    const ref = `Goals/${id}/InviteTokens/${invite_token}`

    const snap = await getDoc(doc(getFirestore(), ref)) as DocumentSnapshot<InviteToken>
    const data = snap.data()
    if (!data?.token) return false

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
      } else return ''
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
    await setDoc(doc(getFirestore(), ref), data) 

    return token
  }
}
