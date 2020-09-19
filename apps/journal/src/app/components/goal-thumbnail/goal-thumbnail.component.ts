import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-goal-thumbnail',
  templateUrl: './goal-thumbnail.component.html',
  styleUrls: ['./goal-thumbnail.component.scss'],
})
export class GoalThumbnailComponent implements OnInit {

  _imageThumbURL: string

  @Input() id: string
  @Input() title: string
  @Input() numberOfSupporters: number
  @Input() numberOfAchievers: number
  @Input() numberOfTimesUsed: number
  @Input() isCollectiveGoal: boolean
  @Input() isTemplate: boolean
  @Input() isFinished: boolean
  @Input() isPublic: boolean

  @Input()
  public set image(_imageThumbURL: string) {
    if (_imageThumbURL) {
      this._imageThumbURL = _imageThumbURL
    }
  }

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {}

  async navToGoal(): Promise<void> {

    if (this.isCollectiveGoal) {

      this.router.navigateByUrl(`collective-goal/${this.id}`)
    
    } else if (this.isTemplate){

      this.router.navigateByUrl(`${this.router.url}/template/${this.id}`)

    } else {
      this.router.navigateByUrl(`goal/${this.id}`)
    }
  }

}
