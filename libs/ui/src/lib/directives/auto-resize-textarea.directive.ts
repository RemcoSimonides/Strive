import { ElementRef, HostListener, Directive, OnInit, NgModule } from '@angular/core';

@Directive({
  selector: 'ion-textarea [autosize]'
})
export class Autosize implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(textArea:HTMLTextAreaElement):void {
    this.resize();
  }

  constructor(public element:ElementRef) {
  }

  ngOnInit(): void {
    setTimeout(() => this.resize(), 0);
  }

  ngModelChange()
  {
    this.resize();
  }

  resize():void 
  {
    let element = this.element.nativeElement.getElementsByClassName("native-textarea")[0];
    if (!element) return
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + 'px';
    this.element.nativeElement.style.height = (scrollHeight + 16) + 'px';    
  }

}

@NgModule({
  exports: [Autosize],
  declarations: [Autosize]
})
export class AutosizeModule { } 