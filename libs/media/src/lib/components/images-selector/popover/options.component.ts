import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonList, IonItem, PopoverController } from '@ionic/angular/standalone'
import { MediaType } from '@strive/model'

@Component({
  standalone: true,
  imports: [
    IonList,
    IonItem
  ],
  selector: 'strive-image-options-popover',
  template: `
    <ion-list lines="none">
      <ion-item button (click)="remove()">Remove {{ type }}</ion-item>
    </ion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageOptionsPopoverComponent {

  @Input() type: MediaType = 'image'

  constructor(
    private popoverCtrl: PopoverController
  ) { }

  remove() {
    this.popoverCtrl.dismiss('remove')
  }
}
