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

@Pipe({ name: 'toHTML', standalone: true })
export class HTMLPipe implements PipeTransform {
  transform(value?: string) {
    if (!value) return ''
    return replaceURLs(value)
  }
}
