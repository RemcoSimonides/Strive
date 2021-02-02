import { Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';

@Component({
  selector: 'strive-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicy implements OnInit {

  constructor(private seo: SeoService) { }

  ngOnInit() {
    // TODO create wrapper for this page and set seo tags in that wrapper.
    // this.seo.generateTags({ title: `Privacy Policy - Strive Journal` })
  }

}
