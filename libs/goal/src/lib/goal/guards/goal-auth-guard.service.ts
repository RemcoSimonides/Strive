import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Services
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { UserService } from '@strive/user/user/+state/user.service';
//Interfaces
import { Goal, GoalStakeholder } from '@strive/model'

@Injectable({
  providedIn: 'root'
})
export class GoalAuthGuardService implements CanActivate {

  private _needsToBeAdmin = false

  constructor(
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
    
    let access = false
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
        
      case 'private':
        if (!this.user.uid) return false
        return await this.checkAccessToGoal(stakeholder)
      }
  }

  private async checkAccessToGoal(stakeholder: GoalStakeholder): Promise<boolean> {

    if (this._needsToBeAdmin) return stakeholder.isAdmin

    if (stakeholder.isAchiever || stakeholder.isAdmin || stakeholder.isSupporter || stakeholder.isSpectator) {
      return true
    } else return false
  }
}
