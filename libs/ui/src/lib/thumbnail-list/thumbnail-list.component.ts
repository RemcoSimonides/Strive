// Angular
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

export interface IThumbnail {
  id: string;
  title: string;
  image: string;
  isFinished: boolean;
}

@Component({
  selector: '[thumbnails][type] thumbnail-list',
  templateUrl: 'thumbnail-list.component.html',
  styleUrls: ['./thumbnail-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThumbnailListComponent {

  @Input() thumbnails: IThumbnail[]
  @Input() type:'collectiveGoal' | 'goal' | 'template';
  @Input() canCreate = false;
  @Input() collectiveGoalId: string;

  @ContentChild('details',{static: false}) detailsTemplateRef: TemplateRef<any>;

  public _goalSlideOptions = goalSlideOptions;

  constructor(
    private router: Router,
    public _platform: Platform
  ) { }

  navTo(id: string) {
    switch (this.type) {
      case 'collectiveGoal':
        this.router.navigateByUrl(`collective-goal/${id}`);
        break;
      
      case 'goal':
        this.router.navigateByUrl(`goal/${id}`);
        break;
      
      case 'template':
        this.router.navigateByUrl(`${this.router.url}/template/${id}`);
    
      default:
        throw new Error("Unknown type of thumbnail");        
    }
  }

}

const goalSlideOptions = {
  spaceBetween: 10,
  centeredSlides: false,
  slidesPerView: 4.2,
  breakpoints: {
      // when window width is <= 240px
      240: {
      slidesPerView: 1,
      },
      360: {
      slidesPerView: 1.3,
      },
      420: {
      slidesPerView: 1.4,
      },
      480: {
      slidesPerView: 1.5,
      },
      520: {
      slidesPerView: 1.7,
      },
      600: {
      slidesPerView: 1.9,
      },
      660: {
      slidesPerView: 2.1,
      spaceBetween: 10
      },
      720: {
      slidesPerView: 2.3,
      },
      780: {
      slidesPerView: 2.5,
      },
      840: {
      slidesPerView: 2.7,
      },
      900: {
      slidesPerView: 3,
      spaceBetween: 10
      },
      960: {
      slidesPerView: 3.2,
      },
      // split pane opens: 304px
      991: {
      slidesPerView: 3.5,
      },
      1030: {
      slidesPerView: 2.5,
      },
      1110: {
      slidesPerView: 2.7,
      },
      1170: {
      slidesPerView: 2.9,
      },
      1230: {
      slidesPerView: 3.1,
      },
      1290: {
      slidesPerView: 3.3
      },
      1350: {
      slidesPerView: 3.5
      },
      1410: {
      slidesPerView: 3.7
      },
      1470: {
      slidesPerView: 3.9
      },
      1530: {
      slidesPerView: 4.1
      },
      1590: {
      slidesPerView: 4.3
      },
      1650: {
      slidesPerView: 4.5
      }
  },
  freeMode: true,
  coverflowEffect: {
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: false,
  }
    
}