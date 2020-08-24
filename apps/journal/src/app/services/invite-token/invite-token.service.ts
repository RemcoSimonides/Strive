import { Injectable } from '@angular/core';
// Angularfire
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
// Services
import { GoalStakeholderService } from '../goal/goal-stakeholder.service';
import { CollectiveGoalStakeholderService } from '../collective-goal/collective-goal-stakeholder.service';
import { FirestoreService } from '../firestore/firestore.service';
// Rxjs
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InviteTokenService {

  private _goalId: string
  private _collectiveGoalId: string
  private _inviteToken: string

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private db: FirestoreService,
    private goalStakeholderService: GoalStakeholderService
  ) { }

  async checkInviteTokenOfGoal(goalId: string, inviteToken: string): Promise<boolean> {

    const ref: string = `Goals/${goalId}/InviteTokens/${inviteToken}`
    this._goalId = goalId
    return await this.checkInviteToken(ref)

  }

  async checkInviteTokenOfCollectiveGoal(collectiveGoalId: string, inviteToken: string): Promise<boolean> {

    const ref: string = `CollectiveGoals/${collectiveGoalId}/InviteTokens/${inviteToken}`
    this._collectiveGoalId = collectiveGoalId
    return await this.checkInviteToken(ref)

  }

  private async checkInviteToken(ref: string): Promise<boolean> {

    return this.afs.doc(ref)
          .snapshotChanges()
          .pipe(take(1))
          .toPromise()
          .then(async snap => {
            if (snap.payload.exists) {

              const currentUser = await this.afAuth.currentUser;

              // user not logged in so no need to create stakeholder
              if (!currentUser) return true

              // token valid! add currently logged in user as stakeholder
              if (this._goalId) {

                await this.goalStakeholderService.upsert(currentUser.uid, this._goalId, {
                  isSpectator: true
                })

              } else if(this._collectiveGoalId) {

                await this.collectiveGoalStakeholderService.upsert(currentUser.uid, this._collectiveGoalId, {
                  isSpectator: true
                })

              }

              return true

            } else {

              // not a valid token
              return false
            
            }
          })

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
