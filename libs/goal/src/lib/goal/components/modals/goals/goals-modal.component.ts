import { Component, Input, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController, PopoverController } from '@ionic/angular'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { GoalStakeholderRole, StakeholderWithGoalAndEvents } from '@strive/model'
import { OptionsPopoverComponent, Roles, RolesForm } from '../../popovers/options/options.component'
import { startWith, Subscription, tap } from 'rxjs'
import { isBefore, min } from 'date-fns'

@Component({
  selector: 'goal-all',
  templateUrl: 'goals-modal.component.html',
  styleUrls: ['./goals-modal.component.scss']
})
export class GoalsModalComponent extends ModalDirective implements OnDestroy {
  
  private _stakeholders: StakeholderWithGoalAndEvents[] = []
  get stakeholders() {
    const roles = this.form.value
    return this._stakeholders.filter(stakeholder => {
      for (const [key, bool] of Object.entries(roles) as [GoalStakeholderRole, boolean][]) {
        if (bool && stakeholder[key]) return true
      }
      return false
    }).sort((a, b) => {
      if (!a.events || !b.events) return 0
      if (a.events.length > 0 && b.events.length === 0) return -1
      if (a.events.length === 0 && b.events.length > 0) return 1

      const earliestA = min(a.events.map((event: any) => event.createdAt!))
      const earliestB = min(b.events.map((event: any) => event.createdAt!))
      return isBefore(earliestA, earliestB) ? -1 : 1
    })
  }
  get length() {
    return this._stakeholders.length
  }

  @Input() set stakeholders(stakeholders: StakeholderWithGoalAndEvents[]) {
    this._stakeholders = stakeholders
  }
  form = new RolesForm(JSON.parse(localStorage.getItem('goals options') ?? '{}'))

  private sub: Subscription

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
  ) {
    super(location, modalCtrl)

    this.sub = this.form.valueChanges.pipe(
      startWith(this.form.value as any),
      tap((value: Roles) => localStorage.setItem('goals options', JSON.stringify(value)))
    ).subscribe()
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  navigateTo(id: string) {
    this.router.navigateByUrl(`goal/${id}`)
    this.modalCtrl.dismiss()
  }

  openOptions(event: UIEvent) {
    this.popoverCtrl.create({
      component: OptionsPopoverComponent,
      componentProps: { form: this.form },
      event
    }).then(popover => popover.present())
  }

}
