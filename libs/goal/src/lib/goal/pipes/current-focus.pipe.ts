import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { GoalStakeholder } from '@strive/model'

export const isCurrentFocus = (stakeholder: GoalStakeholder) => stakeholder.isAchiever && stakeholder.status === 'active'

@Pipe({ name: 'currentFocus' })
export class CurrentFocusPipe implements PipeTransform {
  transform(stakeholders: GoalStakeholder[], reverse = false) {
		return stakeholders.filter(s => reverse ? !isCurrentFocus(s) : isCurrentFocus(s))
  }
}

@NgModule({
  exports: [CurrentFocusPipe],
  declarations: [CurrentFocusPipe]
})
export class CurrentFocusPipeModule { }