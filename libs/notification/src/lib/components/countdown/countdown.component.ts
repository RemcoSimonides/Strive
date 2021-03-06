import { Component, ChangeDetectorRef, Input } from '@angular/core';

@Component({
  selector: 'notification-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent {

  private _time: number;
  private _timing: number = 1000;
  private _interval;

  @Input()
  public set time(value: string | number) {
    this._time = new Date(value).getTime()
    this._startTimer()
  }

  format: string = 'Automatically finalized in {hh} hours and {mm} minutes.';

  public get delta() {
    let date = new Date();
    return Math.max(0, Math.floor((this._time / 1000 - date.getTime() / 1000)));
  }

  public get displayTime() {
    let delta = this.delta
    let time = this.format;

    const days = Math.floor(delta / 86400)
    delta -= days * 86400
    const hours = Math.floor(delta  / 3600) % 24
    delta -= hours * 3600
    const minutes = Math.floor(delta  / 60) % 60

    time = time.replace('{hh}', `${hours}`);
    time = time.replace('{mm}', `${minutes}`);

    return time;
  }

  constructor(private _changeDetector: ChangeDetectorRef) { }

  ngOnDestroy(){
    this._stopTimer();
  }

  private _startTimer() {
    if(this.delta <= 0) return;
    this._stopTimer();
    this._interval = setInterval(() => {
      this._changeDetector.detectChanges();
      if(this.delta <= 0) {
        this._stopTimer();
      }
    }, this._timing);
  }

  private _stopTimer() {
    clearInterval(this._interval);
    this._interval = undefined;
  }

}
