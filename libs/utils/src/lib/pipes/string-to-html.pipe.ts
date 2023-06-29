import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { Pipe, PipeTransform } from '@angular/core'

function replaceURLs(value: string) {
  if(!value) return ''

  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g
  return value.replace(urlRegex, url => {
    let hyperlink = url
    if (!hyperlink.match('^https?://')) {
      hyperlink = 'http://' + hyperlink
    }
    return '<a href="' + hyperlink + '" target="_blank" rel="noopener noreferrer">' + url + '</a>'
  })
}

@Pipe({ name: 'toHTML' })
export class HTMLPipe implements PipeTransform {
  transform(value: string) {
    return replaceURLs(value)
  }
}

@NgModule({
  declarations: [HTMLPipe],
  imports: [CommonModule],
  exports: [HTMLPipe]
})
export class HTMLPipeModule { }
