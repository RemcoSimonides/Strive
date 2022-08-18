import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'
import { createUserLink, GoalStakeholder, UserLink } from '@strive/model'
import { FormControl } from '@angular/forms'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

type GoalStakeholderWithChecked = GoalStakeholder & { checked: boolean }

@Component({
  selector: '[support] support-achievers',
  templateUrl: './achievers.component.html',
  styleUrls: ['./achievers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchieversModalComponent extends ModalDirective implements OnDestroy {

  _achievers: GoalStakeholderWithChecked[] = []
  private _all: GoalStakeholderWithChecked[] = []
  @Input() set achievers(achievers: GoalStakeholder[]) {
    this._achievers = achievers.map(achiever => ({ ...achiever, checked: false }))
    this._all = achievers.map(achiever => ({ ...achiever, checked: false }))
  }

  @Input() recipients!: UserLink[]
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

  submit() {
    const selected = this._all.filter(achiever => achiever.checked)
    for (const recipient of selected) {
      this.recipients.push(createUserLink(recipient))
    }
    this.dismiss()
  }

  selected(event: CustomEvent, achiever: GoalStakeholderWithChecked) {
    const { checked } = event.detail
    
    const stakeholder = this._all.find(a => a.uid === achiever.uid)
    stakeholder!.checked = checked
  }

}