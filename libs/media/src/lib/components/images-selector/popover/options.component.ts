import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonList, IonItem, PopoverController } from '@ionic/angular/standalone'
import { MediaType } from '@strive/model'

@Component({
    imports: [
        IonList,
        IonItem
    ],
    selector: 'strive-image-options-popover',
    template: `
    <ion-list>
      @if (canMoveLeft) {
        <ion-item button (click)="dismiss('left')">Move left</ion-item>
      }
      @if (canMoveRight) {
        <ion-item button (click)="dismiss('right')">Move right</ion-item>
      }
      <ion-item lines="none" button (click)="dismiss('remove')">Remove {{ type }}</ion-item>
    </ion-list>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageOptionsPopoverComponent {

  @Input() type: MediaType = 'image'
  @Input() canMoveLeft = false
  @Input() canMoveRight = false

  constructor(
    private popoverCtrl: PopoverController
  ) { }

  dismiss(value: string) {
    this.popoverCtrl.dismiss(value)
  }
}
