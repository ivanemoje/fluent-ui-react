import * as React from 'react'
// @ts-ignore
import { ThemeContext } from 'react-fela'

import { ProviderContextPrepared } from '../../types'
import { ComponentSlotClasses, ComponentSlotStylesPrepared } from '../../themes/types'
import renderComponent, { RenderResultConfig } from '../../utils/renderComponent'

type UseStylesOptions<Props> = {
  className: string
  mapPropsToStyles: () => Props
}

const useStyles = <Props>(
  displayName: string,
  options: UseStylesOptions<Props>,
): [ComponentSlotClasses, ComponentSlotStylesPrepared] => {
  const context: ProviderContextPrepared = React.useContext(ThemeContext)
  const { className = 'undefined', mapPropsToStyles } = options

  let config: RenderResultConfig<Props> | null = null

  renderComponent<Props>(
    {
      className,
      displayName,
      handledProps: [],
      props: mapPropsToStyles(),
      state: {},
      actionHandlers: {},
      render: c => (config = c),
      saveDebug: () => {},
    },
    context,
  )

  return [config.classes, config.styles]
}

export default useStyles
