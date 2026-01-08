'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { $getRoot, $getSelection, EditorState, $isRangeSelection, UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Heading1,
  Heading2,
} from 'lucide-react'
import { $isHeadingNode, $createHeadingNode } from '@lexical/rich-text'
import { $isListNode } from '@lexical/list'
import { $isQuoteNode, $createQuoteNode } from '@lexical/rich-text'
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { $setBlocksType } from '@lexical/selection'
import { $createParagraphNode, $createTextNode } from 'lexical'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

const theme = {
  heading: {
    h1: 'text-3xl font-bold mt-0 mb-4',
    h2: 'text-2xl font-bold mt-6 mb-3',
    h3: 'text-xl font-bold mt-4 mb-2',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  list: {
    ul: 'list-disc pl-6 my-2',
    ol: 'list-decimal pl-6 my-2',
    listitem: 'my-1',
  },
  quote: 'border-l-4 border-primary pl-4 italic my-4 text-muted-foreground',
  code: 'bg-muted text-primary px-1 py-0.5 rounded text-sm font-mono',
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isHeading1, setIsHeading1] = useState(false)
  const [isHeading2, setIsHeading2] = useState(false)
  const [isBulletList, setIsBulletList] = useState(false)
  const [isOrderedList, setIsOrderedList] = useState(false)
  const [isQuote, setIsQuote] = useState(false)

  const updateToolbar = () => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      
      const anchorNode = selection.anchor.getNode()
      const parent = anchorNode.getParent()
      
      setIsHeading1($isHeadingNode(parent) && parent.getTag() === 'h1')
      setIsHeading2($isHeadingNode(parent) && parent.getTag() === 'h2')
      setIsBulletList($isListNode(parent) && parent.getListType() === 'bullet')
      setIsOrderedList($isListNode(parent) && parent.getListType() === 'number')
      setIsQuote($isQuoteNode(parent))
    }
  }

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar()
      })
    })
  }, [editor])

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }

  const formatHeading1 = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h1'))
      }
    })
  }

  const formatHeading2 = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode('h2'))
      }
    })
  }

  const formatBulletList = () => {
    if (isBulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
    }
  }

  const formatOrderedList = () => {
    if (isOrderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
    }
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  return (
    <div className="flex items-center gap-1 border-b border-border p-2 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBold}
        className={cn('h-8 w-8 p-0', isBold && 'bg-muted')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatItalic}
        className={cn('h-8 w-8 p-0', isItalic && 'bg-muted')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatHeading1}
        className={cn('h-8 w-8 p-0', isHeading1 && 'bg-muted')}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatHeading2}
        className={cn('h-8 w-8 p-0', isHeading2 && 'bg-muted')}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBulletList}
        className={cn('h-8 w-8 p-0', isBulletList && 'bg-muted')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatOrderedList}
        className={cn('h-8 w-8 p-0', isOrderedList && 'bg-muted')}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatQuote}
        className={cn('h-8 w-8 p-0', isQuote && 'bg-muted')}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined)
        }}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined)
        }}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

function Placeholder({ placeholder }: { placeholder?: string }) {
  if (!placeholder) return null
  return (
    <div className="absolute top-4 left-4 pointer-events-none text-muted-foreground">
      {placeholder}
    </div>
  )
}

function OnChangePlugin({ onChange }: { onChange: (content: string) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        onChange(htmlString)
      })
    })
  }, [editor, onChange])

  return null
}

function InitialContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext()
  const [hasSetContent, setHasSetContent] = useState(false)

  useEffect(() => {
    if (content && !hasSetContent) {
      editor.update(() => {
        const parser = new DOMParser()
        const dom = parser.parseFromString(content, 'text/html')
        const root = $getRoot()
        root.clear()

        // Convertir HTML a nodos de Lexical
        const nodes = $generateNodesFromDOM(editor, dom)

        // Filtrar solo nodos válidos para el root (ElementNode o DecoratorNode)
        const validNodes = nodes.filter(node => {
          const nodeType = node.getType()
          // Permitir solo nodos que pueden ser hijos del root
          return nodeType === 'paragraph' ||
                 nodeType === 'heading' ||
                 nodeType === 'list' ||
                 nodeType === 'listitem' ||
                 nodeType === 'quote' ||
                 nodeType === 'code' ||
                 node.constructor.name === 'ElementNode' ||
                 node.constructor.name === 'DecoratorNode'
        })

        root.append(...validNodes)
      })
      setHasSetContent(true)
    }
  }, [content, editor, hasSetContent])

  return null
}

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const initialConfig = {
    namespace: 'RichTextEditor',
    theme,
    onError: (error: Error) => {
      console.error(error)
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
    ],
  }

  if (!isMounted) {
    return (
      <div className={cn('rounded-lg border border-border bg-background', className)}>
        <div className="flex items-center gap-1 border-b border-border p-2 flex-wrap">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-6 w-px bg-border mx-1" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
        <div className="min-h-[300px] p-4" />
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border border-border bg-background', className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative min-h-[300px] p-4">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[300px] outline-none" />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <InitialContentPlugin content={content} />
          <OnChangePlugin onChange={onChange} />
        </div>
      </LexicalComposer>
    </div>
  )
}
