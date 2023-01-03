import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Location } from '@angular/common'
import { ModalController, Platform } from '@ionic/angular'
import { GoalStakeholder, User } from '@strive/model'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

type GoalStakeholderWithChecked = GoalStakeholder & { checked: boolean, profile: User }

@Component({
  selector: '[support] strive-support-achievers',
  templateUrl: './achievers.component.html',
  styleUrls: ['./achievers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchieversModalComponent extends ModalDirective implements OnDestroy {

  _achievers: GoalStakeholderWithChecked[] = []
  private _all: GoalStakeholderWithChecked[] = []
  @Input() set achievers(achievers: (GoalStakeholder & { profile: User })[]) {
    this._achievers = achievers.map(achiever => ({ ...achiever, checked: false }))
    this._all = achievers.map(achiever => ({ ...achiever, checked: false }))
  }

  @Input() recipients!: string[]
  showEveryoneOption = true

  filter = new FormControl()

  private sub = this.filter.valueChanges.pipe().subscribe(value => {
    const filter = value.toLowerCase().trim()
    this._achievers = this._all.filter(achiever => achiever.profile.username.toLowerCase().includes(filter))

    this.showEveryoneOption = !filter || 'everyone'.includes(filter) || 'goal'.includes(filter)
  })

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    protected override platform: Platform
  ) {
    super(location, modalCtrl, platform)
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  submit() {
    const selected = this._all.filter(achiever => achiever.checked)
    for (const recipient of selected) {
      this.recipients.push(recipient.uid)
    }
    this.dismiss()
  }

  selected(event: CustomEvent, achiever: GoalStakeholderWithChecked) {
    const { checked } = event.detail
    
    const stakeholder = this._all.find(a => a.uid === achiever.uid)
    if (!stakeholder) throw new Error('stakeholder not found when selecting')
    stakeholder.checked = checked
  }

}