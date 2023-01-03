import * as Y from "yjs"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useLoaderData, useParams } from "react-router-dom"
import { MonacoBinding } from "y-monaco"
import * as monaco from "monaco-editor"
import useFileSync from "@kylemathews-test/yfs-react"
import useInterval from "../use-interval"
import { awareness, rootDoc } from "../doc-factory"
import { entries } from "../doc-factory"

export async function loader({ params }) {
  if (entries.has(params.entryId)) {
    return { entry: entries.get(params.entryId) }
  } else {
    throw new Response(`Not Found`, { status: 404 })
  }
}

const doc = new Y.Doc()
console.log({ doc })

function LogEntryBase(props) {
  const { entryId } = useParams()
  // const { entry } = useLoaderData()
  console.log({ entryId })
  const entry = entries.get(entryId)
  console.log(entry.toJSON())
  const count = entry
    .get(`count`)
    .toArray()
    .reduce((a, b) => a + b, 0)
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
    // array of numbers which produce a sum
    const yarray = entry.get(`count`)
    const title = entry.get(`title`)
    const body = entry.get(`body`)
    console.log({ yarray, title, body })

    function titleObserve(event) {
      console.log({ event })
      setRender(Math.random())
    }
    title.observe(titleObserve)

    // observe changes of the sum
    // TODO convert to do observeDeep of the entire map and ignore body changes.
    yarray.observe((event) => {
      setRender(Math.random())
    })
    yarray.push([1])
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
      body,
      editor.getModel(),
      new Set([editor]),
      awareness
    )

    config.current = {
      entry,
      yarray,
      title,
      // webRTCProvider,
    }
    return () => {
      // webRTCProvider?.disconnect()
      // webRTCProvider?.destroy()
      // doc?.destroy()
      title.unobserve(titleObserve)
      monacoBinding.destroy()
      editor.dispose()
    }
  }, [entry])

  console.log({ title })
  return (
    <div className="LogEntry">
      <h1>Entry {entry.get(`id`)}</h1>
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
      <button
        onClick={() => {
          console.log({ config })
          config.current?.yarray.push([1])
        }}
      >
        count is {count}
      </button>
    </div>
  )
}

export default LogEntryBase
