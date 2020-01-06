import { ListItemProps } from '@fluentui/react'
import * as React from 'react'

import { createContext, useContextSelector } from './context'

type ListContextValue = {
  debug: ListItemProps['variables']
  selectable: ListItemProps['selectable']
  navigable: ListItemProps['navigable']
  truncateContent: ListItemProps['truncateContent']
  truncateHeader: ListItemProps['truncateHeader']
  variables: ListItemProps['variables']

  onItemClick: (e: React.MouseEvent, index: number) => void
  selectedIndex: number
}

export const ListContext = createContext<ListContextValue>(null)

export const useListConsumer = (index: number) => {
  const selected = useContextSelector(ListContext, v => v.selectedIndex === index)
  const onClick = useContextSelector(ListContext, v => v.onItemClick)
  const debug = useContextSelector(ListContext, v => v.debug)
  const selectable = useContextSelector(ListContext, v => v.selectable)
  const navigable = useContextSelector(ListContext, v => v.navigable)
  const truncateContent = useContextSelector(ListContext, v => v.truncateContent)
  const truncateHeader = useContextSelector(ListContext, v => v.truncateHeader)
  const variables = useContextSelector(ListContext, v => v.variables)

  return {
    selected,
    onClick: e => {
      onClick(e, index)
    },
    debug,
    selectable,
    navigable,
    truncateContent,
    truncateHeader,
    variables,
  }
}
