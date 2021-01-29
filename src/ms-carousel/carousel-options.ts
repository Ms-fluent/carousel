import {InjectionToken} from '@angular/core';

export class MsCarouselDefaultOptions {
  duration: number;
  motion: string;
  width?: string;
  height?: string;
}

export const MS_CAROUSEL_DEFAULT_OPTIONS = new InjectionToken('ms-carousel-default-options', {
  providedIn: 'root',
  factory: MS_CAROUSEL_DEFAULT_OPTIONS_FACTORY
});

export function MS_CAROUSEL_DEFAULT_OPTIONS_FACTORY(): MsCarouselDefaultOptions {
  return {
    duration: 5000,
    motion: 'ease-in-out'
  };
}
