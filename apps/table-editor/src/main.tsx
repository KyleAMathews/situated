import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { SituatedProvider, loader } from 'situated'
import App from './app'

async function main() {
  await loader()
  ReactDOM.createRoot(document.getElementById(`root`) as HTMLElement).render(
    <SituatedProvider>
      <App />
    </SituatedProvider>,
  )
}

main()
