import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { ShareModule } from '@strive/ui/share/share.module'

@Component({
  standalone: true,
  selector: '[url] strive-goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  imports: [
    CommonModule,
    ShareModule
  ]
})
export class GoalSharePopoverComponent {

  @Input() url = ''

  constructor(private popoverCtrl: PopoverController) {}

  close() {
    this.popoverCtrl.dismiss()
  }
}
