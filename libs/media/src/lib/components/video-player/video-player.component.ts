import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core'
import { VideoPosterPipe, VideoUrlPipe } from '@strive/media/pipes/media.pipe';

@Component({
    selector: 'strive-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        VideoUrlPipe,
        VideoPosterPipe
    ]
})
export class VideoPlayerComponent {
	@ViewChild('player', { static: true }) player: ElementRef<HTMLVideoElement> = {} as ElementRef<HTMLVideoElement>;

  @Input() storagePath = ''
}
