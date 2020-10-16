import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Services
import { CollectiveGoalService } from '../+state/collective-goal.service';
import { CollectiveGoalStakeholderService } from '../../stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { ICollectiveGoalStakeholder } from '../../stakeholder/+state/stakeholder.firestore';
import { ICollectiveGoal } from '../+state/collective-goal.firestore';

@Injectable({ providedIn: 'root' })
export class CollectiveGoalAuthGuardService implements CanActivate {

  private _collectiveGoalId: string

  constructor(
    private collectiveGoalService: CollectiveGoalService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private router: Router,
    private user: UserService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    this._collectiveGoalId = next.params.id

    // get collective goal
    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    if (collectiveGoal.isPublic) return true

    if (!await this.user.isLoggedIn) {
      this.router.navigate(['/explore'])
      return false
    }
    
    // get stakeholder
    const stakeholder: ICollectiveGoalStakeholder = await this.collectiveGoalStakeholderService.getStakeholder(this.user.uid, this._collectiveGoalId)

    let access: boolean = false
    if (stakeholder) {
      access = await this.checkAccess(collectiveGoal, stakeholder)
    }

    if (access) {
      return true
    } else {
      this.router.navigate(['/explore'])
      return false
    }

  }

  public async checkAccess(collectiveGoal: ICollectiveGoal, stakeholder: ICollectiveGoalStakeholder): Promise<boolean> {

    if (collectiveGoal.isPublic) {
      return true
    } else {
      return await this.checkStakeholderAccessRights(stakeholder)
    }

  }

  async checkStakeholderAccessRights(stakeholder: ICollectiveGoalStakeholder): Promise<boolean> {

    if (stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSpectator) {
      return true
    } else return false 
  }
}
