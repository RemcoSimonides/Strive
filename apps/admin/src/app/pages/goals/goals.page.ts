import { ChangeDetectionStrategy, Component } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { UpsertGoalModalComponent } from '@strive/goal/goal/components/upsert/upsert.component';
import { SelectUserModalComponent } from '@strive/ui/select-user/select-user.modal';

@Component({
  selector: 'strive-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsPage {

  goals$ = this.goal.valueChanges([orderBy('createdAt', 'desc')]);

  constructor(
    private goal: GoalService,
    private modalCtrl: ModalController
  ) {}

  async add() {
    const selectUserModal = await this.modalCtrl.create({ component: SelectUserModalComponent })
    selectUserModal.onDidDismiss().then(res => {
      const uid = res.data as string
      this.modalCtrl.create({
        component: UpsertGoalModalComponent,
        componentProps: { uid }
      }).then(modal => modal.present())
    })
    selectUserModal.present()
  }
}
