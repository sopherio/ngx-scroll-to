import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';

import { EASING } from '../statics/scroll-to-helpers';
import {
  ScrollToConfigOptions,
  ScrollToListenerTarget
} from '../models/scroll-to-config.model';

export class ScrollToAnimation {

  private _tick: number;
  private _interval: any;
  private _timeLapsed: number;
  private _percentage: number;
  private _position: number;
  private _startPosition: number;
  private _distance: number;
  private _source$: ReplaySubject<number>;
  private _windowScrollTop: number;

  constructor(
    private _container: HTMLElement,
    private _listenerTarget: ScrollToListenerTarget,
    private readonly _isWindow: boolean,
    private readonly _to: number,
    private readonly _options: ScrollToConfigOptions,
    private _isBrowser: boolean
  ) {
    this._tick = 16;
    this._interval = null;
    this._timeLapsed = 0;

    this._windowScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this._startPosition = this._isWindow ? this._windowScrollTop : this._container.scrollTop;

    // Correction for Starting Position of nested HTML Elements
    if (!this._isWindow) this._to = this._to - this._container.getBoundingClientRect().top + this._startPosition;

    // Set Distance
    const directionalDistance = this._startPosition - this._to;
    this._distance = Math.abs(this._startPosition - this._to);

    let offset = this._options.offset;

    // Set offset from Offset Map
    if (this._isBrowser) {

      this._options
        .offsetMap
        .forEach((value, key) => offset = window.innerWidth > key ? value : offset);
    }

    this._distance += offset * (directionalDistance <= 0 ? 1 : -1);
    this._source$ = new ReplaySubject();
  }

  /**
   * Start the new Scroll Animation.
   *
   * @returns       void
   */
  public start(): Observable<any> {
    clearInterval(this._interval);
    this._interval = setInterval(this._loop, this._tick);
    return this._source$.asObservable();
  }

  /**
   * Recursively loop over the Scroll Animation.
   *
   * @returns void
   */
  private _loop = (): void => {
    this._timeLapsed += this._tick;
    this._percentage = (this._timeLapsed / this._options.duration);
    this._percentage = (this._percentage > 1) ? 1 : this._percentage;

    // Position Update
    this._position = this._startPosition +
      ((this._startPosition - this._to < 0 ? 1 : -1) *
      this._distance *
      EASING[this._options.easing](this._percentage));

    this._source$.next(this._position);
    this._isWindow ? this._listenerTarget.scrollTo(0, Math.floor(this._position)) : this._container.scrollTop = Math.floor(this._position);
    this.stop(false);
  }

  /**
   * Stop the current Scroll Animation Loop.
   *
   * @param force 			Force to stop
   */
  public stop(force: boolean = true): void {

    const curr_position = this._isWindow ? this._windowScrollTop : this._container.scrollTop;

    if (force || this._position === (this._to + this._options.offset) || curr_position === (this._to + this._options.offset)) {
      clearInterval(this._interval);
      this._interval = null;
      this._source$.complete();
    }
  }
}
