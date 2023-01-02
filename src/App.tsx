import * as Y from 'yjs'
import { useState, useEffect, useRef, useCallback } from 'react'
import { WebrtcProvider } from 'y-webrtc'
import { MonacoBinding } from 'y-monaco'
import * as monaco from 'monaco-editor'
import * as awarenessProtocol from 'y-protocols/awareness.js'
import "./App.css"
import useFileSync from "@kylemathews-test/yfs-react"
import useInterval from "./use-interval"

 const roomId = 'the-sample-room2'
 const TEST_FILE_NAME = 'yfs-test.md'

 const WEBRTC_SIGNALING_SERVERS = [
  'wss://signaling.yjs.dev',
  'wss://y-webrtc-signaling-us.herokuapp.com',
  'wss://y-webrtc-signaling-eu.herokuapp.com',
]

const doc = new Y.Doc()

function App() {
  const [count, setCount] = useState(0)
  const [title, setTitle] = useState()
  const config = useRef<undefined>(undefined)
      const {
    isSupported,
    setRootDirectory,
    unsetRootDirectory,
    grantWritePermission,
    directoryName,
    isWritePermissionGranted,
    syncDoc
  } = useFileSync()


  const sync = useCallback(() => {
    syncDoc(`test.md`, doc)
  }, [syncDoc])

  useInterval(sync, isWritePermissionGranted ? 5000 : null)

  useEffect(
  () => {
    // array of numbers which produce a sum
    const yarray = doc.getArray('count')
    const title = doc.getText('title')
    const body = doc.getText('body')



    body.observe(event => {
      // console.log(`value of body`, body)
    })
    title.observe(event => {
      // console.log(`value of title`, title.toString())
      setTitle(title.toString())
    })
    // observe changes of the sum
    yarray.observe(event => {
      // print updates when the data changes
      const newSum = yarray.toArray().reduce((a,b) => a + b)
      console.log('new sum: ' + newSum)
      setCount(newSum)
    })
    yarray.push([1])
    const webRTCProvider = new WebrtcProvider(roomId, doc, {
      signaling: WEBRTC_SIGNALING_SERVERS,
      password: null,
      awareness: new awarenessProtocol.Awareness(doc),
      maxConns: 50 + Math.floor(Math.random() * 15),
      filterBcConns: true,
      peerOpts: {}
    })
    const editor = monaco.editor.create(document.getElementById('body-editor'), {
      value: '', // MonacoBinding overwrites this value with the content of type
      defaultLanguage: "markdown",
      codeLens: false,
      fontSize: 14,
      lineHeight: 24,
      lineNumbers: 'off',
      padding: {
        top: 30,
        bottom: 30
      },
      selectionHighlight: false,
      wordWrap: 'on',
      folding: false,
      fontFamily:
        'Menlo, ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      hideCursorInOverviewRuler: true,
      glyphMargin: false,
      lightbulb: { enabled: false },
      lineDecorationsWidth: 20,
      minimap: { enabled: false },
      renderLineHighlight: 'none',
      roundedSelection: true,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        horizontal: 'hidden',
        vertical: 'hidden',
        useShadows: false,
        verticalHasArrows: false,
        verticalScrollbarSize: 0
      },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      snippetSuggestions: 'none',
      suggest: {
        showIcons: false
      },
      tabCompletion: 'off',
      tabSize: 2,
      wordBasedSuggestions: false,
      wrappingStrategy: 'advanced'


    })

    // Bind Yjs to the editor model
    const monacoBinding = new MonacoBinding(body, editor.getModel(), new Set([editor]), webRTCProvider.awareness)

    config.current = {
      doc,
      yarray,
      title,
      webRTCProvider,
    }
    return () => {
      webRTCProvider?.disconnect()
      webRTCProvider?.destroy()
      doc?.destroy()
      monacoBinding.destroy()
      editor.dispose()
    };
  },
  [],
);


  return (
    <div className="App">
            <button
          onClick={() => {
            setRootDirectory(true)
          }}
        >
          Select folder
        </button>

      <h2>Title</h2>
      <input type="text" name="title" value={title} onChange={(e) => {
        config.current.doc.transact(() => {
          console.log(config.current)
          config.current.title.delete(0, config.current.title.length)
          config.current.title.insert(0, e.target.value)
        })
      }} />
      <br />
      <br />
      <h2>Body</h2>
      <div id="body-editor" />
      <button onClick={() => {
        console.log({ config })
        config.current?.yarray.push([1])
      }}>
        count is {count}
      </button>
    </div>
  )
}

export default App
