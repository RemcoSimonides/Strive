import { ChangeDetectionStrategy, Component } from "@angular/core";
// Strive
import { GoalService } from '@strive/goal/goal/goal.service';
import { exercises } from '@strive/exercises/utils';
import { PWAService } from '@strive/utils/services/pwa.service';

@Component({
  selector: 'journal-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {

  goals$ = this.goal.valueChanges(['kWqyr9RQeroZ1QjsSmfU', 'pGvDUf2aWP7gt5EnIEjt', 'UU9oRpCmKIljnTy4JFlL', 'NJQ4AwTN7y0o7Dx0NoNB'])
  exercises = exercises

  constructor (
    private goal: GoalService,
    public pwa: PWAService
  ) {}
}