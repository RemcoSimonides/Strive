import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';

@Component({
  selector: 'strive-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NotificationsPage implements OnInit {
  constructor(
    private seo: SeoService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })
  }
}