/* eslint-disable no-restricted-syntax -- bridge React.JSX to global JSX for React 19 typings */
import type * as React from 'react';

/**
 * React 19 typings expose JSX under `React.JSX`; this shim restores the global
 * `JSX` namespace so existing `children?: JSX.Element` props keep compiling.
 */

declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementClass = React.JSX.ElementClass;
    type ElementType = React.JSX.ElementType;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type LibraryManagedAttributes<
      C extends React.JSX.ElementType,
      P extends object
    > = React.JSX.LibraryManagedAttributes<C, P>;
  }
}
