import { ElementRef } from '@angular/core';
import { ScrollToAnimationEasing } from './scroll-to-easing.model';
import { ScrollToEvent } from './scroll-to-event.model';
/**
 * The target of the Scroll Animation.
 */
export declare type ScrollToTarget = string | number | ElementRef | HTMLElement;
/**
 * The container on which the Scroll Animation
 * will happen.
 */
export declare type ScrollToContainer = string | number | ElementRef | HTMLElement;
/**
 * The Listener Target is responsive for listening
 * to events that could interrupt the Scroll Animation.
 */
export declare type ScrollToListenerTarget = HTMLElement | Window;
/**
 * A mapped list of breakpoints with accompanying
 * values for the offset of that specific breakpoint.
 */
export declare type ScrollToOffsetMap = Map<number, number>;
/**
 * The Configuration Object.
 */
export interface ScrollToConfigOptions {
    /**
     * The target to scroll to.
     */
    target: ScrollToTarget;
    /**
     * The Container to scroll.
     */
    container?: ScrollToContainer;
    /**
     * Duration of the Scroll Animation.
     */
    duration?: number;
    /**
     * The named Easing Function to use.
     */
    easing?: ScrollToAnimationEasing;
    /**
     * The offset from the top of the Element
     * in pixels.
     */
    offset?: number;
    /**
     * A mapped list of offsets.
     */
    offsetMap?: ScrollToOffsetMap;
}
/**
 * The Default Configuration Object.
 */
export interface ScrollToDefaultConfigOptions extends ScrollToConfigOptions {
    action: ScrollToEvent;
}
