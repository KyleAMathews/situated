import 'remirror/styles/all.css'
import './editor.css'

import React from 'react'
import { AnnotationExtension, PlaceholderExtension } from 'remirror/extensions'
import { YjsExtension } from '../remirror-yjs'
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react'

const Editor = ({ provider, xmlType }): JSX.Element => {
  const [props, setProps] = React.useState({ provider, xmlType })
  console.log(`hi`)
  const { manager } = useRemirror({
    extensions: [
      new PlaceholderExtension({
        placeholder: `optional description`,
      }),
      new YjsExtension({ provider: props.provider, xmlType: props.xmlType }),
    ],
    core: { excludeExtensions: [`history`] },
  })

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoRender="end"></Remirror>
    </ThemeProvider>
  )
}

export default Editor
