import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { GoalStakeholder } from '@strive/model'


@Pipe({ name: 'joinButtonText' })
export class JoinButtonTextPipe implements PipeTransform {
  transform(stakeholder: GoalStakeholder) {
    if (stakeholder.isAchiever) return 'JOINED'
    if (stakeholder.isAdmin) return 'JOIN'
    if (stakeholder.hasOpenRequestToJoin) return 'CANCEL REQUEST'
    return 'REQUEST JOIN'
  }
}

@Pipe({ name: 'joinButtonStatus' })
export class JoinButtonStatus implements PipeTransform {
  transform(stakeholder: GoalStakeholder) {
    return stakeholder.isAchiever || stakeholder.hasOpenRequestToJoin
  }
}


@NgModule({
  exports: [JoinButtonTextPipe, JoinButtonStatus],
  declarations: [JoinButtonTextPipe, JoinButtonStatus]
})
export class JoinButtonPipeModule { }
