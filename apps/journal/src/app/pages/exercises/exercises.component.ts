import { ChangeDetectionStrategy, Component } from "@angular/core";
import { exercises } from '@strive/exercises/utils';
import { ScreensizeService } from "@strive/utils/services/screensize.service";

@Component({
  selector: 'strive-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExercisesComponent {
  exercises = exercises
  constructor(public screensize: ScreensizeService) {}
}