const __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    let c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d
    if (typeof Reflect === `object` && typeof Reflect.decorate === `function`)
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (let i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
const __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === `object` && typeof Reflect.metadata === `function`)
      return Reflect.metadata(k, v)
  }
import {
  defaultCursorBuilder,
  defaultDeleteFilter,
  defaultSelectionBuilder,
  redo,
  undo,
  yCursorPlugin,
  ySyncPlugin,
  ySyncPluginKey,
  yUndoPlugin,
  yUndoPluginKey,
} from 'y-prosemirror'
import * as Y from 'yjs'
import {
  command,
  convertCommand,
  ErrorConstant,
  extension,
  ExtensionPriority,
  invariant,
  isEmptyObject,
  isFunction,
  keyBinding,
  NamedShortcut,
  nonChainable,
  PlainExtension,
} from '@remirror/core'
import { ExtensionHistoryMessages as Messages } from '@remirror/messages'
/**
 * The YJS extension is the recommended extension for creating a collaborative
 * editor.
 */
let YjsExtension = class YjsExtension extends PlainExtension {
  get name() {
    return `yjs`
  }
  /**
   * The provider that is being used for the editor.
   */
  get provider() {
    const { provider } = this.options
    return provider
  }
  getBinding() {
    const state = this.store.getState()
    const { binding } = ySyncPluginKey.getState(state)
    return binding
  }
  /**
   * Create the yjs plugins.
   */
  createExternalPlugins() {
    const {
      syncPluginOptions,
      cursorBuilder,
      getSelection,
      xmlType,
      cursorStateField,
      disableUndo,
      protectedNodes,
      trackedOrigins,
      selectionBuilder,
    } = this.options
    // const yDoc = this.provider.doc
    // const type = yDoc.getXmlFragment(`prosemirror`)
    const plugins = [
      ySyncPlugin(xmlType, syncPluginOptions),
      yCursorPlugin(
        this.provider.awareness,
        { cursorBuilder, getSelection, selectionBuilder },
        cursorStateField,
      ),
    ]
    if (!disableUndo) {
      const undoManager = new Y.UndoManager(xmlType, {
        trackedOrigins: new Set([ySyncPluginKey, ...trackedOrigins]),
        deleteFilter: (item) => defaultDeleteFilter(item, protectedNodes),
      })
      plugins.push(yUndoPlugin({ undoManager }))
    }
    return plugins
  }
  /**
   * This managers the updates of the collaboration provider.
   */
  onSetOptions(props) {
    let _a, _b
    const { changes, pickChanged } = props
    const changedPluginOptions = pickChanged([
      `cursorBuilder`,
      `cursorStateField`,
      `xmlType`,
      `getSelection`,
      `syncPluginOptions`,
    ])
    if (!isEmptyObject(changedPluginOptions)) {
      this.store.updateExtensionPlugins(this)
    }
  }
  /**
   * Remove the provider from the manager.
   */
  onDestroy() {
    // if (!this._provider) {
    // return
    // }
    // this.options.destroyProvider(this._provider)
    // this._provider = undefined
  }
  /**
   * Undo that last Yjs transaction(s)
   *
   * This command does **not** support chaining.
   * This command is a no-op and always returns `false` when the `disableUndo` option is set.
   */
  yUndo() {
    return nonChainable((props) => {
      if (this.options.disableUndo) {
        return false
      }
      const { state, dispatch } = props
      const undoManager = yUndoPluginKey.getState(state).undoManager
      if (undoManager.undoStack.length === 0) {
        return false
      }
      if (!dispatch) {
        return true
      }
      return convertCommand(undo)(props)
    })
  }
  /**
   * Redo the last transaction undone with a previous `yUndo` command.
   *
   * This command does **not** support chaining.
   * This command is a no-op and always returns `false` when the `disableUndo` option is set.
   */
  yRedo() {
    return nonChainable((props) => {
      if (this.options.disableUndo) {
        return false
      }
      const { state, dispatch } = props
      const undoManager = yUndoPluginKey.getState(state).undoManager
      if (undoManager.redoStack.length === 0) {
        return false
      }
      if (!dispatch) {
        return true
      }
      return convertCommand(redo)(props)
    })
  }
  /**
   * Handle the undo keybinding.
   */
  undoShortcut(props) {
    return this.yUndo()(props)
  }
  /**
   * Handle the redo keybinding for the editor.
   */
  redoShortcut(props) {
    return this.yRedo()(props)
  }
}
__decorate(
  [
    command({
      disableChaining: true,
      description: ({ t }) => t(Messages.UNDO_DESCRIPTION),
      label: ({ t }) => t(Messages.UNDO_LABEL),
      icon: `arrowGoBackFill`,
    }),
    __metadata(`design:type`, Function),
    __metadata(`design:paramtypes`, []),
    __metadata(`design:returntype`, Object),
  ],
  YjsExtension.prototype,
  `yUndo`,
  null,
)
__decorate(
  [
    command({
      disableChaining: true,
      description: ({ t }) => t(Messages.REDO_DESCRIPTION),
      label: ({ t }) => t(Messages.REDO_LABEL),
      icon: `arrowGoForwardFill`,
    }),
    __metadata(`design:type`, Function),
    __metadata(`design:paramtypes`, []),
    __metadata(`design:returntype`, Object),
  ],
  YjsExtension.prototype,
  `yRedo`,
  null,
)
__decorate(
  [
    keyBinding({ shortcut: NamedShortcut.Undo, command: `yUndo` }),
    __metadata(`design:type`, Function),
    __metadata(`design:paramtypes`, [Object]),
    __metadata(`design:returntype`, Boolean),
  ],
  YjsExtension.prototype,
  `undoShortcut`,
  null,
)
__decorate(
  [
    keyBinding({ shortcut: NamedShortcut.Redo, command: `yRedo` }),
    __metadata(`design:type`, Function),
    __metadata(`design:paramtypes`, [Object]),
    __metadata(`design:returntype`, Boolean),
  ],
  YjsExtension.prototype,
  `redoShortcut`,
  null,
)
YjsExtension = __decorate(
  [
    extension({
      defaultOptions: {
        provider: () => {
          invariant(false, {
            code: ErrorConstant.EXTENSION,
            message: `You must provide a YJS Provider to the \`YjsExtension\`.`,
          })
        },
        xmlType: () => {
          invariant(false, {
            code: ErrorConstant.EXTENSION,
            message: `You must provide a YJS xml type to the \`YjsExtension\`.`,
          })
        },
        destroyProvider: defaultDestroyProvider,
        syncPluginOptions: undefined,
        cursorBuilder: defaultCursorBuilder,
        selectionBuilder: defaultSelectionBuilder,
        cursorStateField: `cursor`,
        getSelection: (state) => state.selection,
        disableUndo: false,
        protectedNodes: new Set(`paragraph`),
        trackedOrigins: [],
      },
      staticKeys: [`disableUndo`, `protectedNodes`, `trackedOrigins`],
      defaultPriority: ExtensionPriority.High,
    }),
  ],
  YjsExtension,
)
export { YjsExtension }
/**
 * The default destroy provider method.
 */
export function defaultDestroyProvider(provider) {
  // const { doc } = provider
  // provider.disconnect()
  // provider.destroy()
  // doc.destroy()
}
function getLazyValue(lazyValue) {
  return isFunction(lazyValue) ? lazyValue() : lazyValue
}
