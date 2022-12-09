import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { combineLatest, map, of, switchMap } from 'rxjs'

import { SupportService } from '@strive/support/support.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { createSupportBase } from '@strive/model'
import { joinWith } from 'ngfire'
import { GoalService } from '@strive/goal/goal/goal.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { ProfileService } from '@strive/user/user/profile.service'

@Component({
  selector: 'journal-support',
  templateUrl: './support.page.html',
  styleUrls: ['./support.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportPageComponent {
  support$ = combineLatest([
    this.auth.profile$,
    this.route.params.pipe(
      map(params => params['id'] as string)
    )
  ]).pipe(
    switchMap(([ profile, id ]) => {
      if (!profile) return of(createSupportBase())

      const { goalId } = this.route.snapshot.queryParams
      if (!goalId) return of(createSupportBase())

      return this.support.valueChanges(id, { goalId }).pipe(
        switchMap(support => {
          if (!support) return of(createSupportBase())
          if (support.supporterId !== profile.uid && support.recipientId !== profile.uid) return of(createSupportBase())
          return of(support).pipe(
            joinWith({
              goal: ({ goalId }) => this.goal.valueChanges(goalId),
              milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestone.valueChanges(milestoneId, { goalId }) : of(undefined),
              recipient: ({ recipientId }) => this.profile.valueChanges(recipientId),
              supporter: ({ supporterId }) => this.profile.valueChanges(supporterId)
            }, { shouldAwait: true })
          )
        })
      )
    })
  )

  constructor(
    private auth: AuthService,
    private goal: GoalService,
    private milestone: MilestoneService,
    private profile: ProfileService,
    private route: ActivatedRoute,
    private router: Router,
    private support: SupportService
  ) {}

  supportRemoved() {
    this.router.navigate(['/supports'])
  }
}
