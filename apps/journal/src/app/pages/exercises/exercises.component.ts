import { ChangeDetectionStrategy, Component } from "@angular/core";
import { exercises } from '@strive/exercises/utils';
import { ScreensizeService } from "@strive/utils/services/screensize.service";
import { SeoService } from "@strive/utils/services/seo.service";

@Component({
  selector: 'strive-exercises',
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExercisesComponent {
  exercises = exercises
  constructor(
    public screensize: ScreensizeService,
    private seo: SeoService
  ) {
    this.seo.generateTags({ title: 'Exercises - Strive Journal' })
  }
}