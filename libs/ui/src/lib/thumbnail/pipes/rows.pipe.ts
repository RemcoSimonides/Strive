import { NgModule, Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'rows' })
export class RowsPipe implements PipeTransform {
  transform(array: any | null, rows: number) {
    if (array === null) return []
    const result = []
    let inter: any[] = []
    array.forEach((value: any, index: number) => {
      inter.push(value)
      if (index % rows === 1) {
        result.push(inter)
        inter = []
      }
    })
    if (inter.length) result.push(inter)
    return result
  }
}

@NgModule({
  exports: [RowsPipe],
  declarations: [RowsPipe]
})
export class RowsPipeModule { }