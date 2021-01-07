import { Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {

  constructor(
    private _seo: SeoService
  ) { }

  ngOnInit() {
    this._seo.generateTags({
      title: `Privacy Policy - Strive Journal`
    })
  }

}
