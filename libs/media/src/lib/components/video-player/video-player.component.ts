import { AfterViewInit, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core'
import { VideoUrlPipe } from '@strive/media/pipes/media.pipe';
// import Hls from 'hls.js'

@Component({
    selector: 'media-video-player',
    templateUrl: './video-player.component.html',
    styleUrls: ['./video-player.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        VideoUrlPipe
    ]
})
export class VideoPlayerComponent implements AfterViewInit {
	@ViewChild('player', { static: true }) player: ElementRef<HTMLVideoElement> = {} as ElementRef<HTMLVideoElement>;

  @Input() storagePath = ''

  ngAfterViewInit() {
    // Vidoe API only available on IMGIX enterprice plan: https://www.imgix.com/pricing
    // if (!this.storagePath) return

    // const video = this.player.nativeElement
    // const src = `https://${environment.firebase.options.projectId}.imgix.video/${encodeURI(this.storagePath)}?fm=hls`

    // if (video.canPlayType('application/vnd.apple.mpegurl')) {
    //   video.src = src
    // } else if (Hls.isSupported()) {
    //   const hls = new Hls()
    //   hls.loadSource(src)
    //   hls.attachMedia(video)
    // } else {
    //   console.error("This is a legacy browser that doesn't support Media Source Extensions")
    // }
  }
}