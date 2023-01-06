import { NgModule, Pipe, PipeTransform } from '@angular/core'
import { GoalStakeholder } from '@strive/model'


// Pure is false because stakeholder can be updated through another Input on join-button.component
@Pipe({ name: 'joinButtonText', pure: false })
export class JoinButtonTextPipe implements PipeTransform {
  transform(stakeholder: GoalStakeholder) {
    if (stakeholder.isAchiever) return 'JOINED'
    if (stakeholder.hasOpenRequestToJoin) return 'CANCEL REQUEST'
    return 'JOIN'
  }
}

// Pure is false because stakeholder can be updated through another Input on join-button.component
@Pipe({ name: 'joinButtonStatus', pure: false })
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
