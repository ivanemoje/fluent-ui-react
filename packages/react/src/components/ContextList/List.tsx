import { Accessibility, listBehavior } from '@fluentui/accessibility'
import * as customPropTypes from '@fluentui/react-proptypes'
import * as _ from 'lodash'
import * as React from 'react'
import * as PropTypes from 'prop-types'

import {
  childrenExist,
  UIComponentProps,
  ChildrenComponentProps,
  commonPropTypes,
  rtlTextContainer,
} from '../../utils'
import ListItem, { ListItemProps } from './ListItem'
import {
  WithAsProp,
  ComponentEventHandler,
  withSafeTypeForAs,
  ShorthandCollection,
} from '../../types'
import { createManager, ManagerFactory } from '@fluentui/state'
import {
  getElementType,
  getUnhandledProps,
  useAccessibility,
  useStateManager,
} from '@fluentui/react-bindings'
import useStyles from './useStyles'
import { useListProvider } from './ListContext'

export interface ListSlotClassNames {
  item: string
}

export interface ListProps extends UIComponentProps, ChildrenComponentProps {
  /** Accessibility behavior if overridden by the user. */
  accessibility?: Accessibility

  /** Toggle debug mode */
  debug?: boolean

  /** Shorthand array of props for ListItem. */
  items?: ShorthandCollection<ListItemProps>

  /** A selectable list formats list items as possible choices. */
  selectable?: boolean

  /** A navigable list allows user to navigate through items. */
  navigable?: boolean

  /** Index of the currently selected item. */
  selectedIndex?: number

  /** Initial selectedIndex value. */
  defaultSelectedIndex?: number

  /**
   * Event for request to change 'selectedIndex' value.
   * @param event - React's original SyntheticEvent.
   * @param data - All props and proposed value.
   */
  onSelectedIndexChange?: ComponentEventHandler<ListProps>

  /** Truncates content */
  truncateContent?: boolean

  /** Truncates header */
  truncateHeader?: boolean

  /** A horizontal list displays elements horizontally. */
  horizontal?: boolean
}

export interface ListState {
  selectedIndex?: number
}

type ListActions = {
  select: (index: number) => void
}

type ListComponent = React.FC<WithAsProp<ListProps>> & {
  className: string
  slotClassNames: ListSlotClassNames

  Item: typeof ListItem
}

const createListManager: ManagerFactory<ListState, ListActions> = config =>
  createManager<ListState, ListActions>({
    ...config,
    actions: {
      select: index => () => ({ selectedIndex: index }),
    },
    state: {
      selectedIndex: -1,
      ...config.state,
    },
  })

const List: ListComponent = props => {
  const { children, selectable, navigable, horizontal, items } = props

  const ElementType = getElementType(props)
  const unhandledProps = getUnhandledProps(Object.keys(List.propTypes) as any, props)

  const [state, actions] = useStateManager(createListManager, {
    mapPropsToInitialState: () => ({
      selectedIndex: props.defaultSelectedIndex,
    }),
    mapPropsToState: () => ({
      selectedIndex: props.selectedIndex,
    }),
  })
  const getA11Props = useAccessibility(props.accessibility, {
    debugName: List.displayName,
    mapPropsToBehavior: () => ({
      selectable,
      navigable,
      horizontal,
    }),
  })
  const [classes] = useStyles(List.displayName, {
    className: List.className,
    mapPropsToStyles: () => props,
  })

  const [Provider, value] = useListProvider({
    debug: props.debug,
    selectable: props.selectable,
    navigable: props.navigable,
    truncateContent: props.truncateContent,
    truncateHeader: props.truncateHeader,
    variables: props.variables,

    onItemClick: (e, index) => {
      if (selectable) {
        actions.select(index)
        _.invoke(props, 'onSelectedIndexChange', e, {
          ...props,
          selectedIndex: index,
        })
      }
    },
    selectedIndex: state.selectedIndex,
  })

  return (
    <ElementType
      {...getA11Props('root', {
        className: classes.root,
        ...rtlTextContainer.getAttributes({ forElements: [children] }),
        ...unhandledProps,
      })}
    >
      <Provider value={value}>
        {childrenExist(children) ? children : _.map(items, ListItem.create)}
      </Provider>
    </ElementType>
  )
}

List.displayName = 'List'
List.className = 'ui-list'
List.slotClassNames = {
  item: `${List.className}__item`,
}
List.propTypes = {
  ...commonPropTypes.createCommon({
    content: false,
  }),
  debug: PropTypes.bool,
  items: customPropTypes.collectionShorthand,
  selectable: customPropTypes.every([customPropTypes.disallow(['navigable']), PropTypes.bool]),
  navigable: customPropTypes.every([customPropTypes.disallow(['selectable']), PropTypes.bool]),
  truncateContent: PropTypes.bool,
  truncateHeader: PropTypes.bool,
  selectedIndex: PropTypes.number,
  defaultSelectedIndex: PropTypes.number,
  onSelectedIndexChange: PropTypes.func,
  horizontal: PropTypes.bool,
} as any
List.defaultProps = {
  as: 'ul',
  accessibility: listBehavior as Accessibility,
}

List.Item = ListItem

/**
 * A List displays a group of related sequential items.
 *
 * @accessibility
 * List may follow one of the following accessibility semantics:
 * - Static non-navigable list. Implements [ARIA list](https://www.w3.org/TR/wai-aria-1.1/#list) role.
 * - Selectable list: allows the user to select item from a list of choices. Implements [ARIA Listbox](https://www.w3.org/TR/wai-aria-practices-1.1/#Listbox) design pattern.
 */
export default withSafeTypeForAs<typeof List, ListProps, 'ul'>(List)
