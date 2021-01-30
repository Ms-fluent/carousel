import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef, forwardRef, HostListener,
  Inject,
  Input, OnDestroy,
  Optional, QueryList, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MS_CAROUSEL_DEFAULT_OPTIONS, MsCarouselDefaultOptions} from './carousel-options';
import {MsCarouselItem} from './carousel-item';

@Component({
  templateUrl: 'carousel.html',
  selector: 'ms-carousel, msCarousel',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'ms-carousel',
    '[class.ms-carousel-hidden-button]': 'hideButtons',
    '[attr.tabindex]': 'tabindex'
  }
})
export class MsCarousel implements AfterViewInit, OnDestroy {
  _event: string;
  @Input()
  tabindex: number = 0;

  @Input()
  duration: number;

  @Input()
  motion: string;

  @Input()
  get height(): string {
    return this._height;
  }

  set height(value: string) {
    this._height = value;
    this.host().style.height = value;
  }

  private _height: string;

  @Input()
  get width(): string {
    return this._width;
  }

  set width(value: string) {
    this._width = value;
    this.host().style.width = value;
  }

  private _width: string;

  /** Id of interval used to slide automatically. */
  private _intervalId: any;

  /** Id of timeout used to hide slide buttons. */
  private _hideButtonTimeOutId: any;

  @ContentChildren(forwardRef(() => MsCarouselItem))
  _items: QueryList<MsCarouselItem>;

  @ViewChild('itemsContainer')
  itemsContainer: ElementRef<HTMLDivElement>;

  hideButtons: boolean = true;

  /** The index of the active slide */
  get activeIndex(): number {
    return this._activeIndex;
  }

  private _activeIndex: number = 0;

  /** The current translation of the slides container. */
  get translateX(): number {
    return this._translateX;
  }

  private _translateX: number = 0;

  /** Tells if a current pan is running. */
  private _isPan: boolean = false;
  private _panStartWidth: number = 0;
  private _panStartOrigin: { x: number, y: number };
  private _panStartTranslate: number = 0;
  private _panStartDirection: number;
  private _panPercent: number = null;


  private _resizeObserver = new ResizeObserver(entries => {
    const width = (entries[0].target as HTMLElement).offsetWidth;
    this.computeWidth(width);
  });


  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _changeDetectorRef: ChangeDetectorRef,
              @Optional() @Inject(MS_CAROUSEL_DEFAULT_OPTIONS) private _options: MsCarouselDefaultOptions) {
  }

  ngAfterViewInit(): void {
    if (this._options) {
      if (this._options.width && this.width) {
        this.width = this._options.width;
      }

      if (this._options.height && !this.height) {
        this.height = this._options.height;
      }

      if (this._options.motion && !this.motion) {
        this.motion = this._options.motion;
      }

      if (this._options.duration && !this.duration) {
        this.duration = this._options.duration;
      }
    }

    this._resizeObserver.observe(this.host());
    this.startInterval();
  }

  ngOnDestroy(): void {
    this._resizeObserver.disconnect();
  }

  computeWidth(width: number) {
    this._items.forEach(item => item.host().style.width = width + 'px');
    this.containerHost().style.width = (this._items.length * width) + 'px';
  }


  @HostListener('keyup', ['$event'])
  onkeyup(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'Right') {
      this.next().then();
      this.refreshInterval();
    } else if (event.key === 'ArrowLeft' || event.key === 'Left') {
      this.prev().then();
      this.refreshInterval();
    }
  }

  @HostListener('swipeleft', ['$event'])
  onswipeleft() {
    if (this._isPan && this._panPercent < -0.5) {
      return;
    }
    if (this.hasNext()) {
      this.next().then();
      this.refreshInterval();
    }
  }

  @HostListener('swiperight', ['$event'])
  onswiperight() {
    if (this._isPan && this._panPercent > 0.5) {
      return;
    }
    if (this.hasPrev()) {
      this.prev().then();
      this.refreshInterval();
    }
  }

  @HostListener('panstart', ['$event'])
  onpanstart(e: any) {
    clearInterval(this._intervalId);
    this._isPan = true;
    this._panStartWidth = this.host().offsetWidth;
    this._panStartOrigin = e.center;
    this._panStartTranslate = this._translateX;
    this._panStartDirection = e.direction;
  }

  @HostListener('pan', ['$event'])
  onpan(e: HammerInput) {
    if((e.direction === 2 || e.direction === 4) && e.direction !== this._panStartDirection) {
      this._panStartDirection = e.direction;
      this._panStartOrigin = e.center;
      this._panStartTranslate = this._translateX;
      console.log('change direction: ' + e.center.x)
    }
    const delta = e.center.x - this._panStartOrigin.x;

    const translateX = this._panStartTranslate + delta;

    const minTranslate = -this._panStartWidth * (this.length() - 1);
    const maxTranslate = 0;

    if (translateX < maxTranslate && translateX > minTranslate) {
      this._translateX = translateX;
      this._panPercent = (this._translateX - this._panStartTranslate) / this._panStartWidth;
      this.containerHost().style.transform = `translateX(${this.translateX}px)`;
    }
  }

  @HostListener('panend', ['$event'])
  onpanend() {
    if (this._panPercent > 0.5) {
      this.prev().then();
    } else if (this._panPercent < -0.5) {
      this.next().then();
    } else {
      this.activateIndex(this.activeIndex).then();
    }
    this._isPan = false;
    this._panPercent = null;
    this.refreshInterval();
  }

  @HostListener('pancancel', ['$event'])
  onpancancel() {
    this._isPan = false;
    this._panPercent = null;
  }


  @HostListener('mousemove', ['$event'])
  onmousemove() {
    if (1) {
      this.hideButtons = false;
      clearTimeout(this._hideButtonTimeOutId);

      this._hideButtonTimeOutId = setTimeout(() => {
        this.hideButtons = true;
      }, 3000);
    }
  }


  buttonClick(direction: 'prev' | 'next') {
    if (direction === 'prev') {
      this.prev().then();
    } else {
      this.next().then();
    }
    this.refreshInterval();
  }

  onIndexClick(index: number) {
    this.activateIndex(index).then();
    this.refreshInterval();
  }

  activateIndex(index: number): Promise<void> {
    const x = this.getTranslation(index);

    this._activeIndex = index;
    this._changeDetectorRef.markForCheck();
    return new Promise<void>(resolve => {
      this.containerHost().animate(
        [
          {transform: `translate(${this._translateX}px, 0)`},
          {transform: `translate(${x}px, 0)`}
        ],
        {duration: 200, fill: 'none', easing: this.motion}
      ).onfinish = () => {
        this._translateX = x;
        this.containerHost().style.transform = `translateX(${this._translateX}px)`;
        resolve();
      };
    });
  }

  next(): Promise<void> {
    if (this.hasNext()) {
      return this.activateIndex(this._activeIndex + 1);
    }
    return Promise.resolve();
  }

  prev(): Promise<void> {
    if (this.hasPrev()) {
      return this.activateIndex(this._activeIndex - 1);
    }
    return Promise.resolve();
  }


  hasNext(): boolean {
    return this._activeIndex < this.length() - 1;
  }

  hasPrev(): boolean {
    return this._activeIndex > 0;
  }

  startInterval() {
    this._intervalId = window.setInterval(() => {
      if (this.hasNext()) {
        this.next().then();
      } else {
        this.activateIndex(0).then();
      }
    }, this.duration);
  }

  refreshInterval(): void {
    this.stopInterval();
    this.startInterval();
  }

  stopInterval(): void {
    clearInterval(this._intervalId);
  }

  length(): number {
    return this._items.length;
  }

  host(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  containerHost(): HTMLDivElement {
    return this.itemsContainer.nativeElement;
  }

  containerWidth(): number {
    return this._items.length * this.host().offsetWidth;
  }

  getTranslation(index: number): number {
    return -this.host().offsetWidth * index;
  }
}
