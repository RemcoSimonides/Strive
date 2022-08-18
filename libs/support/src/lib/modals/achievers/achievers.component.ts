import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'
import { createGoalLink, createUserLink, GoalStakeholder, Support } from '@strive/model'
import { FormControl } from '@angular/forms'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
  selector: '[support] support-achievers',
  templateUrl: './achievers.component.html',
  styleUrls: ['./achievers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchieversModalComponent extends ModalDirective implements OnDestroy {
  _achievers: GoalStakeholder[] = []
  private _all: GoalStakeholder[] = []
  @Input() set achievers(achievers: GoalStakeholder[]) {
    this._achievers = [...achievers]
    this._all = [...achievers]
  }

  @Input() support!: Support
  showEveryoneOption = true

  filter = new FormControl()

  private sub = this.filter.valueChanges.pipe().subscribe(value => {
    const filter = value.toLowerCase().trim()
    this._achievers = this._all.filter(achiever => achiever.username.toLowerCase().includes(filter))

    this.showEveryoneOption = !filter || 'everyone'.includes(filter) || 'goal'.includes(filter)
  })

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController
  ) {
    super(location, modalCtrl)
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  achieverChosen(achiever: GoalStakeholder) {
    this.support.source.receiver = createUserLink(achiever)
    this.dismiss()
  }

  toGoal() {
    this.support.source.receiver = createGoalLink(this.support.source.goal)
    this.dismiss()
  }

}