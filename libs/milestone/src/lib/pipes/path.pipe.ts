import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mSlice',
  pure: false
})
export class MilestonePathPipe implements PipeTransform {

  end: number = 20

  /**
   * @param value a list or a string to be sliced.
   */
  transform<T>(value: ReadonlyArray<T>): Array<T>;
  transform(value: string): string;
  transform(value: null): null;
  transform(value: undefined): undefined;
  transform(value: any): any {
    if (value == null) return value;

    if (value.length <= this.end) {
      return value.slice(0, this.end)
    } else {
      return value.slice(0, this.end) + '...'
    }
  }
}

@NgModule({
  exports: [MilestonePathPipe],
  declarations: [MilestonePathPipe]
})
export class MilestonePathPipeModule { } 