import { CommonModule } from '@angular/common'
import { Component, HostListener, Input } from '@angular/core'
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
  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

  @Input() url = ''

  constructor(private popoverCtrl: PopoverController) {}

  close() {
    this.popoverCtrl.dismiss()
  }
}
