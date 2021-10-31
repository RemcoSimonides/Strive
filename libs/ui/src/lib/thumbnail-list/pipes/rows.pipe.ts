import { NgModule, Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'rows' })
export class RowsPipe implements PipeTransform {
  transform(array: any[], rows: number) {
    const result = []
    let inter = []
    array.forEach((value, index) => {
      inter.push(value)
      if (index % rows === 1) {
        result.push(inter)
        inter = []
      }
    })
    return result
  }
}

@NgModule({
  exports: [RowsPipe],
  declarations: [RowsPipe]
})
export class RowsPipeModule { }