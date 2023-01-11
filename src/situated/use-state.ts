import * as React from 'react'
import { YJSStateContext } from './state-context'

export function useYjs() {
  return React.useContext(YJSStateContext)
}
