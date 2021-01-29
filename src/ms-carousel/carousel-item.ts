import {ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation} from '@angular/core';

@Component({
  template: '<ng-content></ng-content>',
  selector: 'ms-carousel-item, msCarouselItem, [ms-carousel-item], [msCarouselItem]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ms-carousel-item'
  }
})
export class MsCarouselItem {
  constructor(private elementRef: ElementRef<HTMLElement>) {
  }

  host(): HTMLElement {
    return this.elementRef.nativeElement;
  }
}
