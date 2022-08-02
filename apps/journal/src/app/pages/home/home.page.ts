import { ChangeDetectionStrategy, Component } from "@angular/core";
// Strive
import { GoalService } from '@strive/goal/goal/goal.service';
import { exercises } from '@strive/exercises/utils';
import { PWAService } from '@strive/utils/services/pwa.service';
import { AuthModalComponent, enumAuthSegment } from "@strive/user/auth/components/auth-modal/auth-modal.page";
import { ModalController } from "@ionic/angular";

@Component({
  selector: 'journal-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  goals$ = this.goal.valueChanges(['CWIYC1SOxfZYdriIIRZZ', 'pGvDUf2aWP7gt5EnIEjt', '6wxXjXMNcPYDhUKqQPDJ', 'XWi3By2rY2E05M4Snjtx'])
  exercises = exercises
  enumAuthSegment = enumAuthSegment

  constructor (
    private goal: GoalService,
    private modalCtrl: ModalController,
    public pwa: PWAService
  ) {}

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.register
      }
    }).then(modal => modal.present())
  }
}