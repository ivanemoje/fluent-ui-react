import * as React from 'react'
import { createContext, useContextSelector } from './context'
import { ListItemProps } from '@fluentui/react'

type ListContextValue = {
  debug: ListItemProps['variables']
  selectable: ListItemProps['selectable']
  navigable: ListItemProps['navigable']
  truncateContent: ListItemProps['truncateContent']
  truncateHeader: ListItemProps['truncateHeader']
  variables: ListItemProps['variables']

  onItemClick: (index: number) => void
  selectedIndex: number
}

const ListContext = createContext<ListContextValue>(null)

export const useListProvider = props => {
  const registeredItems = React.useRef([])

  const registerChild = React.useCallback(child => {
    let index = registeredItems.current.indexOf(child)

    if (index === -1) {
      index = registeredItems.current.push(child) - 1
    }

    return index
  }, [])

  const unregisterChild = React.useCallback(child => {
    const index = registeredItems.current.indexOf(child)

    registeredItems.current.splice(index, -1)
  }, [])

  const value = {
    ...props,
    registerChild,
    unregisterChild,
  }

  return [ListContext.Provider, value]
}

export const useListConsumer = () => {
  const ref = React.useRef(null)

  const registerChild = useContextSelector(ListContext, v => v.registerChild)
  const unregisterChild = useContextSelector(ListContext, v => v.unregisterChild)

  const currentIndex = registerChild(ref)

  React.useEffect(() => {
    return () => {
      unregisterChild(ref)
    }
  }, [unregisterChild])

  const selected = useContextSelector(ListContext, v => v.selectedIndex === currentIndex)
  const onClick = useContextSelector(ListContext, v => v.onItemClick)
  const debug = useContextSelector(ListContext, v => v.debug)
  const selectable = useContextSelector(ListContext, v => v.selectable)
  const navigable = useContextSelector(ListContext, v => v.navigable)
  const truncateContent = useContextSelector(ListContext, v => v.truncateContent)
  const truncateHeader = useContextSelector(ListContext, v => v.truncateHeader)
  const variables = useContextSelector(ListContext, v => v.variables)

  const selectedIndex = useContextSelector(ListContext, v => v.selectedIndex)

  return {
    selected,
    onClick: e => {
      onClick(e, currentIndex)
    },
    debug,
    selectable,
    navigable,
    truncateContent,
    truncateHeader,
    variables,
    selectedIndex,
  }
}
