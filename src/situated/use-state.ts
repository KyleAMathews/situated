import * as React from 'react'
import { YJSStateContext } from './state-context'

export function useYjs() {
  const { provider, rootDoc } = React.useContext(YJSStateContext)
  return { provider, rootDoc }
}

export function useAuth() {
  const {
    authenticationStatus,
    setAuthenticationStatus,
    accountInfo,
    setAccountInfo,
  } = React.useContext(YJSStateContext)

  return {
    authenticationStatus,

    setAuthenticationStatus,
    accountInfo,
    setAccountInfo,
  }
}
