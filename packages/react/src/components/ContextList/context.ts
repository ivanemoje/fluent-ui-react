import * as React from 'react'

const CONTEXT_LISTENERS =
  process.env.NODE_ENV !== 'production'
    ? Symbol('CONTEXT_LISTENERS')
    : /* for production */ Symbol() // eslint-disable-line symbol-description

const createProvider = <T>(OriginalProvider: React.Provider<T>) =>
  React.memo<React.ProviderProps<T>>(({ value, children }) => {
    const listeners = React.useMemo(() => new Set<Function>(), [])

    // we call listeners in render intentionally.
    // listeners are not technically pure, but
    // otherwise we can't get benefits from concurrent mode.
    // we make sure to work with double or more invocation of listeners.
    listeners.forEach(listener => {
      listener(value)
    })

    return React.createElement(OriginalProvider, { value: { value, listeners } } as any, children)
  })

/**
 * This creates a special context for `useContextSelector`.
 * @param {*} defaultValue
 * @returns {React.Context}
 * @example
 * const PersonContext = createContext({ firstName: '', familyName: '' });
 */
export const createContext = <T>(defaultValue: T) => {
  // make changedBits always zero
  const context = React.createContext(defaultValue, () => 0)
  // shared listeners (not ideal)
  context[CONTEXT_LISTENERS] = true
  // context[CONTEXT_LISTENERS] = new Set();
  // hacked provider
  context.Provider = createProvider(
    context.Provider,
    // context[CONTEXT_LISTENERS]
  )
  // no support for consumer
  delete context.Consumer
  return context
}

/**
 * This hook returns context selected value by selector.
 * It will only accept context created by `createContext`.
 * It will trigger re-render if only the selected value is referencially changed.
 * @param {React.Context} context
 * @param {Function} selector
 * @returns {*}
 * @example
 * const firstName = useContextSelector(PersonContext, state => state.firstName);
 */
export const useContextSelector = (context, selector) => {
  if (!context[CONTEXT_LISTENERS]) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error('useContextSelector requires special context')
    } else {
      // for production
      throw new Error()
    }
  }

  const [, forceUpdate] = React.useReducer(c => c + 1, 0)
  const { listeners, value } = React.useContext(context)
  const selected = selector(value)
  const ref = React.useRef(null)

  React.useLayoutEffect(() => {
    ref.current = {
      f: selector, // last selector "f"unction
      v: value, // last "v"alue
      s: selected, // last "s"elected value
    }
  })

  React.useLayoutEffect(() => {
    const callback = nextValue => {
      try {
        if (ref.current.v === nextValue || Object.is(ref.current.s, ref.current.f(nextValue))) {
          return
        }
      } catch (e) {
        // ignored (stale props or some other reason)
      }

      forceUpdate(null)
    }
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  }, [listeners])

  return selected
}
