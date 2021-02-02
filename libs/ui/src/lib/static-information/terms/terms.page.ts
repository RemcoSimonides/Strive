import { Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';

@Component({
  selector: 'strive-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsComponent implements OnInit {

  constructor(private seo: SeoService) { }

  ngOnInit() {
    // TODO create wrapper for this page and set seo tags in that wrapper.
    // this.seo.generateTags({ title: `Terms - Strive Journal` })
  }

}
