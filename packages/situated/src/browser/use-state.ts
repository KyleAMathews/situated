import * as React from 'react'
import { YJSStateContext } from './state-context'

export function useYjs() {
  const { provider, rootDoc } = React.useContext(YJSStateContext)
  return { provider, rootDoc }
}

export function useAccount() {
  const { accountInfo, setAccountInfo } = React.useContext(YJSStateContext)

  return {
    accountInfo,
    setAccountInfo,
  }
}
