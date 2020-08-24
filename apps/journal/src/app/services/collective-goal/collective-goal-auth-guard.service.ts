import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Services
import { AuthService } from '../auth/auth.service';
import { CollectiveGoalService } from './collective-goal.service';
import { CollectiveGoalStakeholderService } from './collective-goal-stakeholder.service';
// Interfaces
import { ICollectiveGoal } from 'apps/journal/src/app/interfaces/collective-goal.interface';
import { ICollectiveGoalStakeholder } from 'apps/journal/src/app/interfaces/collective-goal-stakeholder.interface';

@Injectable({
  providedIn: 'root'
})
export class CollectiveGoalAuthGuardService implements CanActivate {

  private _collectiveGoalId: string

  constructor(
    private authService: AuthService,
    private collectiveGoalService: CollectiveGoalService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private router: Router
  ) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    this._collectiveGoalId = next.params.id

    // get collective goal
    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(this._collectiveGoalId)

    if (collectiveGoal.isPublic) return true

    if (!await this.authService.isLoggedIn()) {
      this.router.navigate(['/explore'])
      return false
    }
    
    // get stakeholder
    const uid: string = (await this.authService.afAuth.currentUser).uid;
    const stakeholder: ICollectiveGoalStakeholder = await this.collectiveGoalStakeholderService.getStakeholder(uid, this._collectiveGoalId)

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
