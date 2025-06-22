import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { orderBy } from 'firebase/firestore'
import { ModalController } from '@ionic/angular'
import { GoalService } from '@strive/goal/goal.service'
import { SelectUserModalComponent } from '@strive/ui/select-user/select-user.modal'

@Component({
    selector: 'strive-goals',
    templateUrl: './goals.page.html',
    styleUrls: ['./goals.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GoalsComponent {
  private goal = inject(GoalService);
  private modalCtrl = inject(ModalController);


  goals$ = this.goal.valueChanges([orderBy('createdAt', 'desc')])


  async add() {
    const selectUserModal = await this.modalCtrl.create({ component: SelectUserModalComponent })
    selectUserModal.onDidDismiss().then(res => {
      const uid = res.data as string
      // create goal upsert page for admin only
    //   this.modalCtrl.create({
    //     component: UpsertGoalModalComponent,
    //     componentProps: { uid }
    //   }).then(modal => modal.present())
    })
    selectUserModal.present()
  }
}
