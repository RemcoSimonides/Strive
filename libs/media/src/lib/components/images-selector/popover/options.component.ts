import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { IonList, IonItem, PopoverController } from '@ionic/angular/standalone'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem
  ],
  selector: 'strive-image-options-popover',
  template: `
    <ion-list lines="none">
      <ion-item button (click)="remove()">Remove image</ion-item>
    </ion-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageOptionsPopoverComponent {
  constructor(
    private popoverCtrl: PopoverController
  ) { }

  remove() {
    this.popoverCtrl.dismiss('remove')
  }
}
