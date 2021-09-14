import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Angularfire
import { doc, Firestore, getDoc, DocumentSnapshot } from '@angular/fire/firestore';
//Rxjs
import { take } from 'rxjs/operators';
// Services
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service'
import { UserService } from '@strive/user/user/+state/user.service';
//Interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { CollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';

@Injectable({
  providedIn: 'root'
})
export class GoalAuthGuardService implements CanActivate {

  private _needsToBeAdmin: boolean = false

  constructor(
    private db: Firestore,
    private goalService: GoalService,
    private stakeholder: GoalStakeholderService,
    private router: Router,
    private user: UserService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const goalId = next.params.id as string

    const uid = await this.user.getUID()
    if (!uid) {
      this.router.navigate(['/explore'])
      return false
    }

    this._needsToBeAdmin = next.url.some(segment => segment.path === 'edit')

    // get goal
    const goal = await this.goalService.getValue(goalId);

    // get stakeholder
    const stakeholder = await this.stakeholder.getValue(uid, { goalId });
    
    let access: boolean = false
    if (stakeholder) {
      access = await this.checkAccess(goal, stakeholder)
    }

    if (access) {
      return true
    } else {
      this.router.navigate(['/explore'])
      return false
    }
  }

  public async checkAccess(goal: Goal, stakeholder: GoalStakeholder): Promise<boolean> {
    switch (goal.publicity) {
      case 'public':
        return true
        
      case 'collectiveGoalOnly':
        
        if (!this.user.uid) return false

        let accessToCollectiveGoal: boolean
        let accessToGoal: boolean
        if (!!goal.collectiveGoalId) {
          accessToCollectiveGoal = await this.checkAccessToCollectiveGoal(goal.collectiveGoalId, this.user.uid)
        }
        accessToGoal =  await this.checkAccessToGoal(stakeholder)
        return accessToCollectiveGoal || accessToGoal ? true : false

      case 'private':
        if (!this.user.uid) return false
        return await this.checkAccessToGoal(stakeholder)
      }
  }

  private async checkAccessToCollectiveGoal(collectiveGoalId: string, uid: string): Promise<boolean> {

    return getDoc(doc(this.db, `CollectiveGoals/${collectiveGoalId}/CGStakeholders/${uid}`))
      .then((snap: DocumentSnapshot<CollectiveGoalStakeholder>) => {
        if (snap.exists()) {

          const collectiveGoalStakeholder = snap.data()
          // Check if user has any roles active
          if (collectiveGoalStakeholder.isAdmin, collectiveGoalStakeholder.isAchiever, collectiveGoalStakeholder.isSpectator) {
            return true
          } else {
            return false
          }
        } else {
          return false
        }
      })
  }

  private async checkAccessToGoal(stakeholder: GoalStakeholder): Promise<boolean> {

    if (this._needsToBeAdmin) return stakeholder.isAdmin

    if (stakeholder.isAchiever || stakeholder.isAdmin || stakeholder.isSupporter || stakeholder.isSpectator) {
      return true
    } else return false
  }
}
