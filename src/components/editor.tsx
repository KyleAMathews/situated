import 'remirror/styles/all.css'
import './editor.css'

import React from 'react'
import { prosemirrorNodeToHtml } from 'remirror'
import { MarkdownExtension, PlaceholderExtension } from 'remirror/extensions'
import { YjsExtension } from '../remirror-yjs'
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react'

const Editor = ({ provider, xmlType }): JSX.Element => {
  const [props, setProps] = React.useState({ provider, xmlType })
  const { manager, state, setState } = useRemirror({
    extensions: [
      new PlaceholderExtension({
        placeholder: `optional description`,
      }),
      new YjsExtension({ provider: props.provider, xmlType: props.xmlType }),
    ],
    core: { excludeExtensions: [`history`] },
  })
  // console.log(state)
  // console.log({ html: prosemirrorNodeToHtml(state.doc) })

  console.log(xmlType)

  return (
    <ThemeProvider>
      <Remirror
        state={state}
        onChange={(parameter) => setState(parameter.state)}
        manager={manager}
        autoRender="end"
      ></Remirror>
    </ThemeProvider>
  )
}

export default Editor
