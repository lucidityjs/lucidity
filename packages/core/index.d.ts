/**
 * Primary typedefs for Lucidity.
 * @module
 */
import type { JSX } from "./jsx-runtime.d.ts";

// TYPES
/**
 * A reactive signal with an accessor and setter.
 */
export type Signal<T> = [Accessor<T>, Setter<T>];
/**
 * An accessor function to read the value of a signal.
 */
export type Accessor<T> = () => T;
/**
 * A setter function to write the value of a signal.
 */
export type Setter<T> = (value: T) => void;
/**
 * A Lucidity component that takes in a props object and returns a JSX element.
 */
export type Component<P extends object = Record<never, never>> = (props: P) => JSX.Element;

// REACTIVITY
/**
 * Creates a reactive signal with a given inital value, returning an accessor and a setter.
 * @param value The initial value of the signal.
 */
export function createSignal<T>(value: T): Signal<T>;
/**
 * Creates a reactive memo (tracks reactive dependencies and automatically updates) with a given factory function, returning an accessor.
 * @param factory The function used to create the value of the memo.
 * @note Though memos are technically signals, they are immutable (as they are derived), which is why we only return an accessor here.
 */
export function createMemo<T>(factory: Accessor<T>): Accessor<T>;
/**
 * Creates a reactive effect (tracks reactive dependencies and automatically re-runs) with a given function.
 * @param fn The function to run when dependencies are updated.
 */
export function createEffect(fn: () => void): void;

// INLINE FNS
/**
 * Mounts a component into a given HTML (or SVG) element.
 * @param el The element to mount into.
 * @param component The component to run to create the HTML.
 */
export function mount(el: Element, component: Component): void;