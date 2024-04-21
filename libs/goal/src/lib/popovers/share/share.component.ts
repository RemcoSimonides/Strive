import { CommonModule } from '@angular/common'
import { Component, HostListener, Input } from '@angular/core'
import { IonButton, IonIcon, PopoverController } from '@ionic/angular/standalone'
import { ShareComponent } from '@strive/ui/share/share.component'
import { addIcons } from 'ionicons'
import { shareSocialOutline } from 'ionicons/icons'

@Component({
  standalone: true,
  selector: '[url] strive-goal-share-popover',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss'],
  imports: [
    CommonModule,
    ShareComponent,
    IonButton,
    IonIcon
  ]
})
export class GoalSharePopoverComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

  @Input() url = ''

  constructor(private popoverCtrl: PopoverController) {
    addIcons({ shareSocialOutline })
  }

  close() {
    this.popoverCtrl.dismiss()
  }
}
