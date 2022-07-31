import { ChangeDetectionStrategy, Component, Input, OnDestroy } from "@angular/core";
import { Location } from '@angular/common';
import { ModalController } from "@ionic/angular";
import { createGoalStakeholder, GoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
import { FormControl } from "@angular/forms";
import { ModalDirective } from "@strive/utils/directives/modal.directive";

@Component({
  selector: 'support-achievers',
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

  filter = new FormControl()

  private sub = this.filter.valueChanges.pipe().subscribe(value => {
    this._achievers = this._all.filter(achiever => achiever.username.toLowerCase().includes(value.toLowerCase()))
  })

  constructor(
    protected location: Location,
    protected modalCtrl: ModalController
  ) {
    super(location, modalCtrl)
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  achieverChosen(achiever: GoalStakeholder) {
    this.dismiss(achiever)
  }

  dontGive() {
    this.dismiss(createGoalStakeholder())
  }

}