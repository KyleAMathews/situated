import * as Y from "yjs"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useLoaderData, useParams } from "react-router-dom"
import { MonacoBinding } from "y-monaco"
import * as monaco from "monaco-editor"
import useFileSync from "@kylemathews-test/yfs-react"
import useInterval from "../use-interval"
import { awareness, rootDoc } from "../doc-factory"
import { entries } from "../doc-factory"
import { subtext } from "./entry.css"

// export async function loader({ params }) {
// if (entries.has(params.entryId)) {
// return { entry: entries.get(params.entryId) }
// } else {
// throw new Response(`Not Found`, { status: 404 })
// }
// }

const doc = new Y.Doc()
console.log({ doc })

function LogEntryBase(props) {
  const { entryId } = useParams()
  // const { entry } = useLoaderData()
  console.log({ entryId })
  const entry = entries.get(entryId)
  console.log(entry.toJSON())
  const [, setRender] = useState()
  const title = entry.get(`title`).toString()
  console.log({ title })
  const config = useRef<undefined>(undefined)
  // const {
  // isSupported,
  // setRootDirectory,
  // unsetRootDirectory,
  // grantWritePermission,
  // directoryName,
  // isWritePermissionGranted,
  // syncDoc,
  // } = useFileSync()

  // const sync = useCallback(() => {
  // syncDoc(`test.md`, doc)
  // }, [syncDoc])

  // useInterval(sync, isWritePermissionGranted ? 5000 : null)

  useEffect(() => {
    function entryObserve(event) {
      console.log({ event })
      setRender(Math.random())
    }
    entry.observeDeep(entryObserve)

    const editor = monaco.editor.create(
      document.getElementById(`body-editor`),
      {
        value: ``, // MonacoBinding overwrites this value with the content of type
        defaultLanguage: `markdown`,
        codeLens: false,
        fontSize: 14,
        lineHeight: 24,
        lineNumbers: `off`,
        padding: {
          top: 30,
          bottom: 30,
        },
        selectionHighlight: false,
        wordWrap: `on`,
        folding: false,
        fontFamily: `Menlo, ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
        hideCursorInOverviewRuler: true,
        glyphMargin: false,
        lightbulb: { enabled: false },
        lineDecorationsWidth: 20,
        minimap: { enabled: false },
        renderLineHighlight: `none`,
        roundedSelection: true,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
          horizontal: `hidden`,
          vertical: `hidden`,
          useShadows: false,
          verticalHasArrows: false,
          verticalScrollbarSize: 0,
        },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        snippetSuggestions: `none`,
        suggest: {
          showIcons: false,
        },
        tabCompletion: `off`,
        tabSize: 2,
        wordBasedSuggestions: false,
        wrappingStrategy: `advanced`,
      }
    )

    // Bind Yjs to the editor model
    const monacoBinding = new MonacoBinding(
      entry.get(`body`),
      editor.getModel(),
      new Set([editor]),
      awareness
    )

    return () => {
      // webRTCProvider?.disconnect()
      // webRTCProvider?.destroy()
      // doc?.destroy()
      entry.unobserveDeep(entryObserve)
      monacoBinding.destroy()
      editor.dispose()
    }
  }, [entry])

  return (
    <div className="LogEntry">
      <h1>
        Entry: {entry.get(`type`)} [
        {entry.get(`categories`).toArray().join(`,`)}]
      </h1>
      <h3 className={subtext}>
        created:{` `}
        {new Date(entry.get(`created_at`)).toLocaleDateString()}
        {`—`}
        {new Date(entry.get(`created_at`)).toLocaleTimeString()}
      </h3>

      <button
        onClick={() => {
          setRootDirectory(true)
        }}
      >
        Select folder
      </button>
      <h2>Title</h2>
      <input
        type="text"
        name="title"
        value={title}
        onChange={(e) => {
          rootDoc.transact(() => {
            entry.get(`title`).delete(0, entry.get(`title`).length)
            entry.get(`title`).insert(0, e.target.value)
          })
        }}
      />
      <br />
      <br />
      <h2>Body</h2>
      <div id="body-editor" />
    </div>
  )
}

export default LogEntryBase
