import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Angularfire2
import { AngularFirestore } from '@angular/fire/firestore';
//Rxjs
import { take } from 'rxjs/operators';
// Services
import { GoalService } from '../goal/goal.service';
import { GoalStakeholderService } from './goal-stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
//Interfaces
import {
  IGoal,
  enumGoalPublicity,
  IGoalStakeholder,
  ICollectiveGoalStakeholder
} from '@strive/interfaces'

@Injectable({
  providedIn: 'root'
})
export class GoalAuthGuardService implements CanActivate {

  private _goalId: string
  private _needsToBeAdmin: boolean = false

  constructor(
    private afs: AngularFirestore,
    private goalService: GoalService,
    private goalStakeholderService: GoalStakeholderService,
    private router: Router,
    private user: UserService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    this._goalId = next.params.id
    
    if (!await this.user.isLoggedIn) {
      this.router.navigate(['/explore'])
      return false
    }

    const index = next.url.findIndex(segment => segment.path === 'edit')
    if (index > -1) {
      this._needsToBeAdmin = true
    }

    // get goal
    const goal: IGoal = await this.goalService.getGoal(this._goalId)

    // get stakeholder
    const stakeholder: IGoalStakeholder = await this.goalStakeholderService.getStakeholder(this.user.uid, this._goalId)
    
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

  public async checkAccess(goal: IGoal, stakeholder: IGoalStakeholder): Promise<boolean> {

    switch (goal.publicity) {
      case enumGoalPublicity.public:
        return true
        
      case enumGoalPublicity.collectiveGoalOnly:
        
        if (!await this.user.isLoggedIn) return false

        let accessToCollectiveGoal: boolean
        let accessToGoal: boolean
        if (goal.collectiveGoal.id) {
          accessToCollectiveGoal = await this.checkAccessToCollectiveGoal(goal.collectiveGoal.id, this.user.uid)
        }
        accessToGoal =  await this.checkAccessToGoal(stakeholder)
        return accessToCollectiveGoal || accessToGoal ? true : false

      case enumGoalPublicity.private:

        if (!await this.user.isLoggedIn) return false
        return await this.checkAccessToGoal(stakeholder)
      }
  }

  private async checkAccessToCollectiveGoal(collectiveGoalId: string, uid: string): Promise<boolean> {

    return this.afs.doc<ICollectiveGoalStakeholder>(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${uid}`)
      .snapshotChanges()
      .pipe(take(1))
      .toPromise()
      .then(collectiveGoalStakeholderSnap => {

        if (collectiveGoalStakeholderSnap.payload.exists) {

          const collectiveGoalStakeholder: ICollectiveGoalStakeholder = collectiveGoalStakeholderSnap.payload.data()
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

  private async checkAccessToGoal(stakeholder: IGoalStakeholder): Promise<boolean> {

    if (this._needsToBeAdmin) return stakeholder.isAdmin

    if (stakeholder.isAchiever || stakeholder.isAdmin || stakeholder.isSupporter || stakeholder.isSpectator) {
      return true
    } else return false
  }
}
