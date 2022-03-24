import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy } from "@angular/core";
import { Location } from '@angular/common';
import { ModalController } from "@ionic/angular";
import { createGoalStakeholder, GoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'support-achievers',
  templateUrl: './achievers.component.html',
  styleUrls: ['./achievers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchieversPopoverComponent implements OnDestroy {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  _achievers: GoalStakeholder[] = []
  private _all: GoalStakeholder[] = []
  @Input() set achievers(achievers: GoalStakeholder[]) {
    this._achievers = [...achievers]
    this._all = [...achievers]
  }

  @Input() result: Array<GoalStakeholder>

  filter = new FormControl()

  private sub = this.filter.valueChanges.pipe().subscribe(value => {
    this._achievers = this._all.filter(achiever => achiever.username.toLowerCase().includes(value.toLowerCase()))
  })

  constructor(
    private location: Location,
    private modalCtrl: ModalController
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  dismiss() {
    this.location.back()
  }

  achieverChosen(achiever: GoalStakeholder) {
    this.result.push(achiever)
    this.dismiss()
  }

  dontGive() {
    this.result.push(createGoalStakeholder())
    this.dismiss()
  }

}