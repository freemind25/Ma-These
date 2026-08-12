'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code as CodeIcon, Quote,
  Heading1, Heading2, Heading3, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, Link as LinkIcon, Undo2, Redo2, Minus, Type, Sparkles,
} from 'lucide-react'
import InlineAIMenu from '@/components/thesis/inline-ai-menu'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  chapterNumber: string
  chapterTitle: string
  aiProvider?: string
}

function ToolbarBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', active && 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-700')}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  )
}

export default function TiptapEditor({ content, onChange, chapterNumber, chapterTitle, aiProvider = 'z-ai' }: TiptapEditorProps) {
  const isSettingContent = useRef(false)
  const [inlineAIMenu, setInlineAIMenu] = useState<{ visible: boolean; position: { top: number; left: number }; text: string }>({ visible: false, position: { top: 0, left: 0 }, text: '' })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: `Commencez la redaction du Chapitre ${chapterNumber || 'I'}. ${chapterTitle || ''}...` }),
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      CharacterCount,
      TextStyle,
      Color,
      Link.configure({ openOnClick: true, HTMLAttributes: { class: 'text-emerald-600 underline' } }),
      Typography,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-full p-6 sm:p-10 text-[15px] leading-[1.8] font-serif text-slate-800',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isSettingContent.current) {
        const html = editor.getHTML()
        onChange(html)
      }
    },
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      isSettingContent.current = true
      editor.commands.setContent(content)
      isSettingContent.current = false
    }
  }, [content, editor])

  const addLink = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL du lien :')
    if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  // ─── Inline AI: show floating menu on text selection ───
  const selectionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!editor) return
    const updateMenu = () => {
      const { from, to, empty } = editor.state.selection
      if (empty || from === to) {
        if (selectionTimer.current) clearTimeout(selectionTimer.current)
        setInlineAIMenu(prev => prev.visible ? { visible: false, position: prev.position, text: prev.text } : prev)
        return
      }
      // Debounce: only show after 300ms of stable selection
      if (selectionTimer.current) clearTimeout(selectionTimer.current)
      selectionTimer.current = setTimeout(() => {
        const text = editor.state.doc.textBetween(from, to, ' ')
        if (text.trim().length < 10) return // Don't show for very short selections
        // Get position from selection DOM
        const dom = window.getSelection()
        if (!dom || dom.rangeCount === 0) return
        const range = dom.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setInlineAIMenu({ visible: true, position: { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX + rect.width / 2 - 128 }, text: text.trim() })
      }, 500)
    }
    editor.on('selectionUpdate', updateMenu)
    return () => {
      editor.off('selectionUpdate', updateMenu)
      if (selectionTimer.current) clearTimeout(selectionTimer.current)
    }
  }, [editor])

  const handleInlineAIApply = useCallback((_actionId: string, resultText: string) => {
    if (!editor) return
    const { from, to } = editor.state.selection
    if (from === to) return
    // Replace the selected text with the AI result
    editor.chain().focus().deleteRange({ from, to }).insertContent(resultText).run()
  }, [editor])

  const characters = editor?.storage.characterCount?.characters() || 0
  const words = editor?.storage.characterCount?.words() || 0

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="animate-pulse text-sm text-slate-400">Chargement de l'editeur...</div>
      </div>
    )
  }

  const hasSelection = !editor.state.selection.empty

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white relative">
      <div className="shrink-0 border-b bg-white px-2 py-1 flex items-center gap-0.5 flex-wrap overflow-x-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Annuler (Ctrl+Z)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rétablir (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToggleGroup type="single" value={
          editor.isActive('heading', { level: 1 }) ? 'h1' :
          editor.isActive('heading', { level: 2 }) ? 'h2' :
          editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
        } onValueChange={(v) => {
          if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run()
          else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run()
          else if (v === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run()
          else if (v === 'p') editor.chain().focus().setParagraph().run()
        }}>
          <ToggleGroupItem value="p" className="h-7 w-7 p-0" title="Paragraphe"><Type className="h-3.5 w-3.5" /></ToggleGroupItem>
          <ToggleGroupItem value="h1" className="h-7 w-7 p-0" title="Titre 1"><Heading1 className="h-3.5 w-3.5" /></ToggleGroupItem>
          <ToggleGroupItem value="h2" className="h-7 w-7 p-0" title="Titre 2"><Heading2 className="h-3.5 w-3.5" /></ToggleGroupItem>
          <ToggleGroupItem value="h3" className="h-7 w-7 p-0" title="Titre 3"><Heading3 className="h-3.5 w-3.5" /></ToggleGroupItem>
        </ToggleGroup>
        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras"><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique"><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligner"><UnderlineIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barre"><Strikethrough className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><CodeIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Aligner a gauche"><AlignLeft className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centrer"><AlignCenter className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Aligner a droite"><AlignRight className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justifier"><AlignJustify className="h-3.5 w-3.5" /></ToolbarBtn>
        <Separator orientation="vertical" className="h-5 mx-1" />

        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste a puces"><List className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numerotee"><ListOrdered className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation"><Quote className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Bloc de code"><CodeIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne horizontale">
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <ToolbarBtn active={editor.isActive('link')} onClick={addLink} title="Lien"><LinkIcon className="h-3.5 w-3.5" /></ToolbarBtn>
        <ToolbarBtn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} title="Surligner"><Highlighter className="h-3.5 w-3.5" /></ToolbarBtn>

        <Separator orientation="vertical" className="h-5 mx-1" />

        {/* Inline AI button — shows menu on click when text is selected */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('h-7 w-7', hasSelection ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700' : 'text-slate-300 pointer-events-none')}
              disabled={!hasSelection}
              onClick={() => {
                const { from, to } = editor.state.selection
                const text = editor.state.doc.textBetween(from, to, ' ')
                if (text.trim().length >= 10) {
                  const dom = window.getSelection()
                  if (dom && dom.rangeCount > 0) {
                    const range = dom.getRangeAt(0)
                    const rect = range.getBoundingClientRect()
                    setInlineAIMenu({ visible: true, position: { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX + rect.width / 2 - 128 }, text: text.trim() })
                  }
                }
              }}
              title="IA contextuelle (sélectionnez du texte)"
            >
              <Sparkles className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>IA contextuelle (Ctrl+Shift+A)</TooltipContent>
        </Tooltip>

        <div className="flex-1" />
        <span className="text-[10px] text-slate-400 tabular-nums whitespace-nowrap">{words} mots</span>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />
        {/* Inline AI floating menu */}
        {inlineAIMenu.visible && inlineAIMenu.text && (
          <InlineAIMenu
            position={inlineAIMenu.position}
            selectedText={inlineAIMenu.text}
            onApply={handleInlineAIApply}
            onClose={() => setInlineAIMenu(prev => ({ ...prev, visible: false }))}
            aiProvider={aiProvider}
          />
        )}
      </div>

      <div className="shrink-0 border-t bg-slate-50 px-4 py-1 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>{characters} caracteres</span>
          <span>{words} mots</span>
        </div>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          Inline IA actif
        </span>
      </div>
    </div>
  )
}
