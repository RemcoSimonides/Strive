import { Injectable } from '@angular/core';
// Angularfire
import { AngularFireStorage } from '@angular/fire/storage';
// Services
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  public image: any
  public fallbackImage: string

  constructor(
    private afStorage: AngularFireStorage,
  ) { }


  async reset(): Promise<void> {
    this.image = undefined
    this.fallbackImage = undefined
  }

  setDataUrlImage(dataUrl: string, id: string): File {

    this.image = this.dataURLtoFile(dataUrl, id)
    return this.image

  }

  async uploadDataURL(dataUrl: string, id: string, reference: string): Promise<string> {

    const file = this.dataURLtoFile(dataUrl, `${id}.jpeg`)
    this.image = file
    return await this.uploadImage(reference, false)

  }

  async uploadImage(reference: string, deletePreviousImage: boolean): Promise<string> {

    if (!this.image) return this.fallbackImage

    const imageRef = this.afStorage.ref(reference)

    //delete previous image
    if (deletePreviousImage) await imageRef.delete()

    //resize image
    return new Promise((resolve) => {

      this.compress(this.image).subscribe(res => {
        if (res) {
          resolve(res)
        }
      })

    }).then((resizedImage) => {

      //upload image
      return imageRef.put(resizedImage, { contentType: 'image/jpeg' }).then(() => {

        return new Promise((resolve) => {

          //get download url from uploaded image
          imageRef.getDownloadURL().subscribe(result => { resolve(result) })
          
        }).then((downloadURL) => { return downloadURL })

      })

    })

  }

  // https://zocada.com/compress-resize-images-javascript-browser/
  private compress(file: File): Observable<any> {
    const width = 600; // For scaling relative to width
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return Observable.create(observer => {
      reader.onload = ev => {
        const img = new Image();
        img.src = (ev.target as any).result;
        (img.onload = () => {
          const elem = document.createElement('canvas'); // Use Angular's Renderer2 method
          const scaleFactor = width / img.width;
          elem.width = width;
          elem.height = img.height * scaleFactor;
          const ctx = <CanvasRenderingContext2D>elem.getContext('2d');
          ctx.drawImage(img, 0, 0, width, img.height * scaleFactor);
          ctx.canvas.toBlob(
            blob => {
              observer.next(
                new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                }),
              );
            },
            'image/jpeg',
            1,
          );
        }),
          (reader.onerror = error => observer.error(error));
      };
    });
  }

  private dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

}
