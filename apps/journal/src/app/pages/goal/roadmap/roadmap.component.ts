import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { orderBy, where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { UserService } from '@strive/user/user/user.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { SupportService } from '@strive/support/support.service'
import { Goal, Milestone, createGoalStakeholder, GoalStakeholder } from '@strive/model'

@Component({
  selector: '[goal] journal-goal-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  stakeholder$?: Observable<GoalStakeholder>
  milestones$?: Observable<Milestone[]>

  _goal?: Goal
  private _previousGoalId = ''
  @Input() set goal(goal: Goal) {
    if (!goal) return
    this._goal = goal

    const goalIdChanged = goal.id !== this._previousGoalId
    if (goalIdChanged) {
      this._previousGoalId = goal.id
      this.stakeholder$ = this.user.user$.pipe(
        switchMap(user => user ? this.stakeholderService.valueChanges(user.uid, { goalId: goal.id }) : of(undefined)),
        map(stakeholder => createGoalStakeholder(stakeholder))
      )
  
      this.milestones$ = this.milestone.valueChanges([orderBy('order', 'asc')], { goalId: goal.id }).pipe(
        joinWith({
          supports: milestone => this.user.user$.pipe(
            switchMap(user => {
              if (!user) return of([])
              const recipientQuery = [
                where('source.milestone.id', '==', milestone.id),
                where('source.recipient.uid', '==', user.uid)
              ]
              const supporterQuery = [
                where('source.milestone.id', '==', milestone.id),
                where('source.supporter.uid', '==', user.uid)
              ]
              return combineLatest([
                this.supportService.valueChanges(recipientQuery, { goalId: goal.id }),
                this.supportService.valueChanges(supporterQuery, { goalId: goal.id }),
              ]).pipe(
                map(([ recipientSupports, supporterSupports ]) => {
                  const supports = [ ...recipientSupports, ...supporterSupports]
                  return supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)
                })
              )
            })
          )
        }, { shouldAwait: false })
      )
    }
  }

  constructor(
    private milestone: MilestoneService,
    private stakeholderService: GoalStakeholderService,
    private supportService: SupportService,
    private user: UserService
  ) { }
}