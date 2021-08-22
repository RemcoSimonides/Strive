import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
// Services
import { CollectiveGoalService } from '../+state/collective-goal.service';
import { CollectiveGoalStakeholderService } from '../../stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
@Injectable({ providedIn: 'root' })
export class CollectiveGoalGuard implements CanActivate {

  constructor(
    private collectiveGoalService: CollectiveGoalService,
    private stakeholder: CollectiveGoalStakeholderService,
    private router: Router,
    private user: UserService
  ) { }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const collectiveGoalId = next.params.id as string
    const collectiveGoal = await this.collectiveGoalService.getValue(collectiveGoalId)

    if (collectiveGoal.isSecret) {
      const uid = await this.user.getUID()
      if (!uid) {
        this.router.navigate(['/explore'])
        return false
      }
      const stakeholder = await this.stakeholder.getValue(uid, { collectiveGoalId })
      if (!!stakeholder && (stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSpectator)) {
        return true
      } else {
        this.router.navigate(['/explore'])
        return false
      }
    } else {
      return true
    }
  }
}
