import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'

import { IonContent } from '@ionic/angular/standalone'

import { joinWith } from 'ngfire'
import { combineLatest, map, of, switchMap } from 'rxjs'

import { SupportService } from '@strive/support/support.service'
import { AuthService } from '@strive/auth/auth.service'
import { createSupportBase } from '@strive/model'
import { GoalService } from '@strive/goal/goal.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { ProfileService } from '@strive/user/profile.service'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { SupportDetailsComponent } from '@strive/support/components/details/details.component'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'

@Component({
    selector: 'journal-support',
    templateUrl: './support.page.html',
    styleUrls: ['./support.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        HeaderComponent,
        SupportDetailsComponent,
        PagenotfoundComponent,
        IonContent
    ]
})
export class SupportPageComponent {
  private auth = inject(AuthService);
  private goal = inject(GoalService);
  private milestone = inject(MilestoneService);
  private profile = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private support = inject(SupportService);

  support$ = combineLatest([
    this.auth.profile$,
    this.route.params.pipe(
      map(params => params['id'] as string)
    )
  ]).pipe(
    switchMap(([profile, id]) => {
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
              milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestone.valueChanges(milestoneId, { goalId }) : of(undefined),
              recipient: ({ recipientId }) => this.profile.valueChanges(recipientId),
              supporter: ({ supporterId }) => this.profile.valueChanges(supporterId)
            }, { shouldAwait: true })
          )
        })
      )
    })
  )

  supportRemoved() {
    this.router.navigate(['/supports'])
  }
}
