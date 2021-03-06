import { Directive, ElementRef, Inject, Injectable, Input, NgModule, PLATFORM_ID, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Observable as Observable$1 } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { ReplaySubject as ReplaySubject$1 } from 'rxjs/ReplaySubject';
/**
 * Default values for Component Input.
 */
var DEFAULTS = {
    target: null,
    action: 'click',
    duration: 650,
    easing: 'easeInOutQuad',
    offset: 0,
    offsetMap: new Map()
};
/**
 * Easing Colleciton.
 */
var EASING = {
    easeInQuad: function (time) {
        return time * time;
    },
    easeOutQuad: function (time) {
        return time * (2 - time);
    },
    easeInOutQuad: function (time) {
        return time < 0.5 ? 2 * time * time : -1 + (4 - 2 * time) * time;
    },
    easeInCubic: function (time) {
        return time * time * time;
    },
    easeOutCubic: function (time) {
        return (--time) * time * time + 1;
    },
    easeInOutCubic: function (time) {
        return time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
    },
    easeInQuart: function (time) {
        return time * time * time * time;
    },
    easeOutQuart: function (time) {
        return 1 - (--time) * time * time * time;
    },
    easeInOutQuart: function (time) {
        return time < 0.5 ? 8 * time * time * time * time : 1 - 8 * (--time) * time * time * time;
    },
    easeInQuint: function (time) {
        return time * time * time * time * time;
    },
    easeOutQuint: function (time) {
        return 1 + (--time) * time * time * time * time;
    },
    easeInOutQuint: function (time) {
        return time < 0.5 ? 16 * time * time * time * time * time : 1 + 16 * (--time) * time * time * time * time;
    },
    easeOutElastic: function (time) {
        return Math.pow(2, -10 * time) * Math.sin((time - 1 / 4) * (2 * Math.PI) / 1) + 1;
    }
};
/**
 * Set of allowed events as triggers
 * for the Animation to start.
 */
var EVENTS = [
    'click',
    'mouseenter',
    'mouseover',
    'mousedown',
    'mouseup',
    'dblclick',
    'contextmenu',
    'wheel',
    'mouseleave',
    'mouseout'
];
/**
 * Strip hash (#) from value.
 *
 * @param {?} value 				The given string value
 * @return {?} 					The stripped string value
 */
function stripHash(value) {
    return value.substring(0, 1) === '#' ? value.substring(1) : value;
}
/**
 * Test if a given value is a string.
 *
 * @param {?} value 					The given value
 * @return {?} 						Whether the given value is a string
 */
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
/**
 * Test if a given Element is the Window.
 *
 * @param {?} container 				The given Element
 * @return {?} 						Whether the given Element is Window
 */
function isWindow(container) {
    return container === window;
}
/**
 * Test if a given value is of type ElementRef.
 *
 * @param {?} value 					The given value
 * @return {?} Whether the given value is a number
 */
function isElementRef(value) {
    return value instanceof ElementRef;
}
/**
 * Whether or not the given value is a Native Element.
 *
 * @param {?} value           The given value
 * @return {?} Whether or not the value is a Native Element
 */
function isNativeElement(value) {
    return value instanceof HTMLElement;
}
/**
 * Test if a given value is type number.
 *
 * @param {?} value 					The given value
 * @return {?} 						Whether the given value is a number
 */
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}
var ScrollToAnimation = /** @class */ (function () {
    /**
     * @param {?} _container
     * @param {?} _listenerTarget
     * @param {?} _isWindow
     * @param {?} _to
     * @param {?} _options
     * @param {?} _isBrowser
     */
    function ScrollToAnimation(_container, _listenerTarget, _isWindow, _to, _options, _isBrowser) {
        var _this = this;
        this._container = _container;
        this._listenerTarget = _listenerTarget;
        this._isWindow = _isWindow;
        this._to = _to;
        this._options = _options;
        this._isBrowser = _isBrowser;
        /**
         * Recursively loop over the Scroll Animation.
         *
         * @return void
         */
        this._loop = function () {
            _this._timeLapsed += _this._tick;
            _this._percentage = (_this._timeLapsed / _this._options.duration);
            _this._percentage = (_this._percentage > 1) ? 1 : _this._percentage;
            // Position Update
            _this._position = _this._startPosition +
                ((_this._startPosition - _this._to < 0 ? 1 : -1) *
                    _this._distance *
                    EASING[_this._options.easing](_this._percentage));
            _this._source$.next(_this._position);
            _this._isWindow ? _this._listenerTarget.scrollTo(0, Math.floor(_this._position)) : _this._container.scrollTop = Math.floor(_this._position);
            _this.stop(false);
        };
        this._tick = 16;
        this._interval = null;
        this._timeLapsed = 0;
        this._windowScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this._startPosition = this._isWindow ? this._windowScrollTop : this._container.scrollTop;
        // Correction for Starting Position of nested HTML Elements
        if (!this._isWindow)
            this._to = this._to - this._container.getBoundingClientRect().top + this._startPosition;
        // Set Distance
        var directionalDistance = this._startPosition - this._to;
        this._distance = Math.abs(this._startPosition - this._to);
        var offset = this._options.offset;
        // Set offset from Offset Map
        if (this._isBrowser) {
            this._options
                .offsetMap
                .forEach(function (value, key) { return offset = window.innerWidth > key ? value : offset; });
        }
        this._distance += offset * (directionalDistance <= 0 ? 1 : -1);
        this._source$ = new ReplaySubject$1();
    }
    /**
     * Start the new Scroll Animation.
     *
     * @return {?} void
     */
    ScrollToAnimation.prototype.start = function () {
        clearInterval(this._interval);
        this._interval = setInterval(this._loop, this._tick);
        return this._source$.asObservable();
    };
    /**
     * Stop the current Scroll Animation Loop.
     *
     * @param {?=} force 			Force to stop
     * @return {?}
     */
    ScrollToAnimation.prototype.stop = function (force) {
        if (force === void 0) { force = true; }
        var /** @type {?} */ curr_position = this._isWindow ? this._windowScrollTop : this._container.scrollTop;
        if (force || this._position === (this._to + this._options.offset) || curr_position === (this._to + this._options.offset)) {
            clearInterval(this._interval);
            this._interval = null;
            this._source$.complete();
        }
    };
    return ScrollToAnimation;
}());
/**
 * The ScrollToService handles starting, interrupting
 * and ending the actual Scroll Animation. It provides
 * some utilities to find the proper HTML Element on a
 * given page to setup Event Listeners and calculate
 * distances for the Animation.
 */
var ScrollToService = /** @class */ (function () {
    /**
     * Construct and setup required paratemeters.
     *
     * @param {?} _document         A Reference to the Document
     * @param {?} _platformId       Angular Platform ID
     */
    function ScrollToService(_document, _platformId) {
        this._document = _document;
        this._platformId = _platformId;
        this._interruptiveEvents = ['mousewheel', 'DOMMouseScroll', 'touchstart'];
    }
    /**
     * Target an Element to scroll to. Notice that the `TimeOut` decorator
     * ensures the executing to take place in the next Angular lifecycle.
     * This allows for scrolling to elements that are e.g. initially hidden
     * by means of `*ngIf`, but ought to be scrolled to eventually.
     *
     * \@todo type 'any' in Observable should become custom type like 'ScrollToEvent' (base class), see issue comment:
     * 	- https://github.com/nicky-lenaers/ngx-scroll-to/issues/10#issuecomment-317198481
     *
     * @param {?} options         Configuration Object
     * @return {?} Observable
     */
    ScrollToService.prototype.scrollTo = function (options) {
        if (!isPlatformBrowser(this._platformId))
            return new ReplaySubject$1().asObservable();
        return this._start(options);
    };
    /**
     * Start a new Animation.
     *
     * \@todo Emit proper events from subscription
     *
     * @param {?} options         Configuration Object
     * @return {?} Observable
     */
    ScrollToService.prototype._start = function (options) {
        var _this = this;
        // Merge config with default values
        var /** @type {?} */ mergedConfigOptions = Object.assign({}, /** @type {?} */ (DEFAULTS), options);
        if (this._animation)
            this._animation.stop();
        var /** @type {?} */ targetNode = this._getNode(mergedConfigOptions.target);
        if (!targetNode)
            return Observable$1.throw(new Error('Unable to get Target Element'));
        var /** @type {?} */ container = this._getContainer(mergedConfigOptions, targetNode);
        if (!container)
            return Observable$1.throw(new Error('Unable to get Container Element'));
        var /** @type {?} */ listenerTarget = this._getListenerTarget(container);
        var /** @type {?} */ to = isWindow(listenerTarget) ? targetNode.offsetTop : targetNode.getBoundingClientRect().top;
        // Create Animation
        this._animation = new ScrollToAnimation(container, listenerTarget, isWindow(listenerTarget), to, mergedConfigOptions, isPlatformBrowser(this._platformId));
        var /** @type {?} */ onInterrupt = function () { return _this._animation.stop(); };
        this._addInterruptiveEventListeners(listenerTarget, onInterrupt);
        // Start Animation
        var /** @type {?} */ animation$ = this._animation.start();
        this._subscribeToAnimation(animation$, listenerTarget, onInterrupt);
        return animation$;
    };
    /**
     * Subscribe to the events emitted from the Scrolling
     * Animation. Events might be used for e.g. unsubscribing
     * once finished.
     *
     * @param {?} animation$              The Animation Observable
     * @param {?} listenerTarget          The Listener Target for events
     * @param {?} onInterrupt             The handler for Interruptive Events
     * @return {?} Void
     */
    ScrollToService.prototype._subscribeToAnimation = function (animation$, listenerTarget, onInterrupt) {
        var _this = this;
        var /** @type {?} */ subscription = animation$
            .subscribe(function () { }, function () { }, function () {
            _this._removeInterruptiveEventListeners(_this._interruptiveEvents, listenerTarget, onInterrupt);
            subscription.unsubscribe();
        });
    };
    /**
     * Get the container HTML Element in which
     * the scrolling should happen.
     *
     * @param {?} options         The Merged Configuration Object
     * @param {?} targetNode
     * @return {?}
     */
    ScrollToService.prototype._getContainer = function (options, targetNode) {
        var /** @type {?} */ container = options.container ?
            this._getNode(options.container, true) :
            this._getFirstScrollableParent(targetNode);
        return container;
    };
    /**
     * Add listeners for the Animation Interruptive Events
     * to the Listener Target.
     *
     * @param {?} listenerTarget    Target to attach the listener on
     * @param {?} handler           Handler for when the listener fires
     * @return {?} Void
     */
    ScrollToService.prototype._addInterruptiveEventListeners = function (listenerTarget, handler) {
        this._interruptiveEvents.forEach(function (event) { return listenerTarget.addEventListener(event, handler); });
    };
    /**
     * Remove listeners for the Animation Interrupt Event from
     * the Listener Target. Specifying the correct handler prevents
     * memory leaks and makes the allocated memory available for
     * Garbage Collection.
     *
     * @param {?} events            List of Interruptive Events to remove
     * @param {?} listenerTarget    Target to attach the listener on
     * @param {?} handler           Handler for when the listener fires
     * @return {?} Void
     */
    ScrollToService.prototype._removeInterruptiveEventListeners = function (events, listenerTarget, handler) {
        events.forEach(function (event) { return listenerTarget.removeEventListener(event, handler); });
    };
    /**
     * Find the first scrollable parent Node of a given
     * Element. The DOM Tree gets searched upwards
     * to find this first scrollable parent. Parents might
     * be ignored by CSS styles applied to the HTML Element.
     *
     * @param {?} nativeElement     The Element to search the DOM Tree upwards from
     * @return {?} The first scrollable parent HTML Element
     */
    ScrollToService.prototype._getFirstScrollableParent = function (nativeElement) {
        var /** @type {?} */ style = window.getComputedStyle(nativeElement);
        var /** @type {?} */ overflowRegex = /(auto|scroll)/;
        if (style.position === 'fixed')
            return null;
        for (var /** @type {?} */ parent = nativeElement; parent = parent.parentElement; null) {
            style = window.getComputedStyle(parent);
            if (style.position === 'absolute'
                || style.overflow === 'hidden'
                || style.overflowY === 'hidden')
                continue;
            if (overflowRegex.test(style.overflow + style.overflowY + style.overflowX)
                || parent.tagName === 'BODY')
                return parent;
        }
        return null;
    };
    /**
     * Get the Target Node to scroll to.
     *
     * @param {?} id              The given ID of the node, either a string or
     *                        an element reference
     * @param {?=} allowBodyTag    Indicate whether or not the Document Body is
     *                        considered a valid Target Node
     * @return {?} The Target Node to scroll to
     */
    ScrollToService.prototype._getNode = function (id, allowBodyTag) {
        if (allowBodyTag === void 0) { allowBodyTag = false; }
        var /** @type {?} */ targetNode;
        if (isString(id)) {
            if (allowBodyTag && (id === 'body' || id === 'BODY')) {
                targetNode = this._document.body;
            }
            else {
                targetNode = this._document.getElementById(stripHash(id));
            }
        }
        else if (isNumber(id)) {
            targetNode = this._document.getElementById(String(id));
        }
        else if (isElementRef(id)) {
            targetNode = id.nativeElement;
        }
        else if (isNativeElement(id)) {
            targetNode = id;
        }
        return targetNode;
    };
    /**
     * Retrieve the Listener target. This Listener Target is used
     * to attach Event Listeners on. In case of the target being
     * the Document Body, we need the actual `window` to listen
     * for events.
     *
     * @param {?} container           The HTML Container element
     * @return {?} The Listener Target to attach events on
     */
    ScrollToService.prototype._getListenerTarget = function (container) {
        return this._isDocumentBody(container) ? window : container;
    };
    /**
     * Test if a given HTML Element is the Document Body.
     *
     * @param {?} element             The given HTML Element
     * @return {?} Whether or not the Element is the
     *                            Document Body Element
     */
    ScrollToService.prototype._isDocumentBody = function (element) {
        return element.tagName.toUpperCase() === 'BODY';
    };
    return ScrollToService;
}());
ScrollToService.decorators = [
    { type: Injectable },
];
/**
 * @nocollapse
 */
ScrollToService.ctorParameters = function () { return [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] },] },
    { type: undefined, decorators: [{ type: Inject, args: [PLATFORM_ID,] },] },
]; };
var ScrollToDirective = /** @class */ (function () {
    /**
     * @param {?} _elementRef
     * @param {?} _scrollToService
     * @param {?} _renderer2
     */
    function ScrollToDirective(_elementRef, _scrollToService, _renderer2) {
        this._elementRef = _elementRef;
        this._scrollToService = _scrollToService;
        this._renderer2 = _renderer2;
        this.ngxScrollTo = DEFAULTS.target;
        this.ngxScrollToEvent = DEFAULTS.action;
        this.ngxScrollToDuration = DEFAULTS.duration;
        this.ngxScrollToEasing = DEFAULTS.easing;
        this.ngxScrollToOffset = DEFAULTS.offset;
        this.ngxScrollToOffsetMap = DEFAULTS.offsetMap;
    }
    /**
     * Angular Lifecycle Hook - After View Init
     *
     * \@todo Implement Subscription for Events
     *
     * @return {?} void
     */
    ScrollToDirective.prototype.ngAfterViewInit = function () {
        var _this = this;
        // Test Event Support
        if (EVENTS.indexOf(this.ngxScrollToEvent) === -1)
            throw new Error("Unsupported Event '" + this.ngxScrollToEvent + "'");
        // Listen for the trigger...
        this._renderer2.listen(this._elementRef.nativeElement, this.ngxScrollToEvent, function (event) {
            _this._options = {
                target: _this.ngxScrollTo,
                duration: _this.ngxScrollToDuration,
                easing: _this.ngxScrollToEasing,
                offset: _this.ngxScrollToOffset,
                offsetMap: _this.ngxScrollToOffsetMap
            };
            _this._scrollToService.scrollTo(_this._options);
        });
    };
    return ScrollToDirective;
}());
ScrollToDirective.decorators = [
    { type: Directive, args: [{
                selector: '[ngx-scroll-to]'
            },] },
];
/**
 * @nocollapse
 */
ScrollToDirective.ctorParameters = function () { return [
    { type: ElementRef, },
    { type: ScrollToService, },
    { type: Renderer2, },
]; };
ScrollToDirective.propDecorators = {
    'ngxScrollTo': [{ type: Input, args: ['ngx-scroll-to',] },],
    'ngxScrollToEvent': [{ type: Input, args: ['ngx-scroll-to-event',] },],
    'ngxScrollToDuration': [{ type: Input, args: ['ngx-scroll-to-duration',] },],
    'ngxScrollToEasing': [{ type: Input, args: ['ngx-scroll-to-easing',] },],
    'ngxScrollToOffset': [{ type: Input, args: ['ngx-scroll-to-offset',] },],
    'ngxScrollToOffsetMap': [{ type: Input, args: ['ngx-scroll-to-offset-map',] },],
};
var ScrollToModule = /** @class */ (function () {
    function ScrollToModule() {
    }
    /**
     * Guaranteed singletons for provided Services across App.
     *
     * @return {?} An Angular Module with Providers
     */
    ScrollToModule.forRoot = function () {
        return {
            ngModule: ScrollToModule,
            providers: [
                ScrollToService
            ]
        };
    };
    return ScrollToModule;
}());
ScrollToModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    ScrollToDirective
                ],
                exports: [
                    ScrollToDirective
                ]
            },] },
];
/**
 * @nocollapse
 */
ScrollToModule.ctorParameters = function () { return []; };
/**
 * Generated bundle index. Do not edit.
 */
export { ScrollToModule, ScrollToService, ScrollToDirective as ɵa };
//# sourceMappingURL=ngx-scroll-to.es5.js.map
