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

  constructor(
    private collectiveGoalService: CollectiveGoalService,
    private collectiveGoalStakeholderService: CollectiveGoalStakeholderService,
    private router: Router,
    private user: UserService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const collectiveGoalId = next.params.id

    // get collective goal
    const collectiveGoal: ICollectiveGoal = await this.collectiveGoalService.getCollectiveGoal(collectiveGoalId)

    if (collectiveGoal.isPublic) return true

    if (!this.user.uid) {
      this.router.navigate(['/explore'])
      return false
    }
    
    // get stakeholder
    const stakeholder: ICollectiveGoalStakeholder = await this.collectiveGoalStakeholderService.getStakeholder(this.user.uid, collectiveGoalId)

    let access: boolean = false
    if (stakeholder) {
      access = stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSpectator
    }

    if (access) {
      return true
    } else {
      this.router.navigate(['/explore'])
      return false
    }

  }

}
