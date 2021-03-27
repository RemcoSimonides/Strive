import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'media-image-selector',
  templateUrl: 'image-selector.component.html',
  styleUrls: ['./image-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageSelectorComponent implements OnInit {
  constructor() { }

  ngOnInit() { }
}