import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MsCarousel} from './carousel';
import {MsCarouselItem} from './carousel-item';
import {HammerModule} from '@angular/platform-browser';

@NgModule({
  imports: [ CommonModule, HammerModule ],
  declarations: [ MsCarousel, MsCarouselItem],
  exports: [ MsCarousel, MsCarouselItem]
})
export class MsCarouselModule {}
