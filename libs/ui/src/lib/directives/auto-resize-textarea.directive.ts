import { ElementRef, HostListener, Directive, OnInit, NgModule } from '@angular/core';

@Directive({
  selector: 'ion-textarea [autosize]'
})
export class AutosizeDirective implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(textArea:HTMLTextAreaElement) {
    this.resize();
  }

  constructor(public element:ElementRef) {
  }

  ngOnInit() {
    setTimeout(() => this.resize(), 0);
  }

  ngModelChange() {
    this.resize();
  }

  resize() {
    const element = this.element.nativeElement.getElementsByClassName("native-textarea")[0];
    if (!element) return
    const scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.element.nativeElement.style.height = (scrollHeight + 16) + 'px';    
  }

}

@NgModule({
  exports: [AutosizeDirective],
  declarations: [AutosizeDirective]
})
export class AutosizeModule { } 