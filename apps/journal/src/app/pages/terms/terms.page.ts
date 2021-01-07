import { Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {

  constructor(
    private _seo: SeoService,
  ) { }

  ngOnInit() {
    this._seo.generateTags({
      title: `Terms - Strive Journal`
    })
  }

}
