'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ClipboardList, Plus, Copy, Check, ChevronDown, ChevronRight,
  FileText, Lightbulb, BookOpen,
} from 'lucide-react'
import { SLR_PROTOCOL_SECTIONS, SLR_KEY_REFERENCES, type ProtocolField } from '@/data/slr-protocol-guide'

type ViewMode = 'form' | 'preview'

interface SlrProtocolPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SlrProtocolPanel({ open, onOpenChange }: SlrProtocolPanelProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [listValues, setListValues] = useState<Record<string, string[]>>({})
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('form')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [newListItem, setNewListItem] = useState<Record<string, string>>({})

  const setValue = (id: string, value: string) => setValues(prev => ({ ...prev, [id]: value }))

  const addListItem = (fieldId: string) => {
    const text = newListItem[fieldId]?.trim()
    if (!text) return
    setListValues(prev => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), text],
    }))
    setNewListItem(prev => ({ ...prev, [fieldId]: '' }))
  }

  const removeListItem = (fieldId: string, index: number) => {
    setListValues(prev => ({
      ...prev,
      [fieldId]: (prev[fieldId] || []).filter((_, i) => i !== index),
    }))
  }

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  const generateProtocol = () => {
    let text = '# Protocole de Revue Systématique de la Littérature\n\n'
    for (const section of SLR_PROTOCOL_SECTIONS) {
      text += `## ${section.number}. ${section.title}\n\n`
      text += `${section.description}\n\n`
      for (const field of section.fields) {
        const val = field.type === 'list'
          ? (listValues[field.id] || []).join('\n- ')
          : values[field.id]
        if (val?.trim()) {
          text += `### ${field.label}\n${val}\n\n`
        }
      }
      text += '\n'
    }
    return text
  }

  const handleCopyProtocol = async () => {
    await navigator.clipboard.writeText(generateProtocol())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => {
    setValues({})
    setListValues({})
  }

  const renderField = (field: ProtocolField) => {
    if (field.type === 'select') {
      return (
        <Select value={values[field.id] || ''} onValueChange={v => setValue(field.id, v)}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-xs h-8">
            <SelectValue placeholder="Sélectionner…" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {field.options?.map(opt => (
              <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (field.type === 'list') {
      const items = listValues[field.id] || []
      return (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <span className="text-[10px] text-slate-500 font-mono w-4 text-right">{idx + 1}.</span>
              <span className="flex-1 text-xs text-slate-200 bg-slate-800/50 px-2 py-1 rounded">
                {item}
              </span>
              <button
                onClick={() => removeListItem(field.id, idx)}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-1.5">
            <Input
              value={newListItem[field.id] || ''}
              onChange={e => setNewListItem(prev => ({ ...prev, [field.id]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addListItem(field.id))}
              placeholder={field.placeholder}
              className="flex-1 bg-slate-800 border-slate-700 text-xs h-7"
            />
            <Button
              variant="ghost" size="sm"
              onClick={() => addListItem(field.id)}
              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          value={values[field.id] || ''}
          onChange={e => setValue(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="bg-slate-800 border-slate-700 text-xs resize-none"
        />
      )
    }

    // text
    return (
      <Input
        value={values[field.id] || ''}
        onChange={e => setValue(field.id, e.target.value)}
        placeholder={field.placeholder}
        className="bg-slate-800 border-slate-700 text-xs h-8"
      />
    )
  }

  const totalFilled = Object.values(values).filter(v => v?.trim()).length
    + Object.values(listValues).reduce((sum, arr) => sum + arr.length, 0)
  const totalFields = SLR_PROTOCOL_SECTIONS.reduce((sum, s) => sum + s.fields.length, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-slate-950 border-slate-800 p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <SheetTitle className="text-sm font-semibold text-white">
                  Outils SLR — Protocole de revue systématique
                </SheetTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Guide PRISMA-P complet pour structurer votre protocole
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                {totalFilled} / {totalFields} champs
              </Badge>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs: Form / Preview / References */}
        <div className="px-6 shrink-0">
          <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
            <TabsList className="bg-slate-900 h-8">
              <TabsTrigger value="form" className="text-xs h-7 gap-1.5 data-[state=active]:bg-slate-800">
                <FileText className="h-3 w-3" /> Formulaire
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs h-7 gap-1.5 data-[state=active]:bg-slate-800">
                <BookOpen className="h-3 w-3" /> Aperçu
              </TabsTrigger>
              <TabsTrigger value="refs" className="text-xs h-7 gap-1.5 data-[state=active]:bg-slate-800">
                <Lightbulb className="h-3 w-3" /> Références
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Separator className="bg-slate-800" />

        <div className="flex-1 overflow-hidden">
          {/* FORM VIEW */}
          {viewMode === 'form' && (
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                {SLR_PROTOCOL_SECTIONS.map((section, sIdx) => {
                  const isCollapsed = collapsedSections[section.id]
                  return (
                    <div key={section.id} className="rounded-xl bg-slate-900/50 border border-slate-800/50 overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors text-left"
                      >
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 w-5 h-5 rounded flex items-center justify-center shrink-0">
                          {sIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-white truncate">{section.title}</h3>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{section.description}</p>
                        </div>
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {!isCollapsed && (
                        <div className="px-4 pb-4 space-y-3 border-t border-slate-800/50">
                          {section.fields.map(field => (
                            <div key={field.id}>
                              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 mb-1.5">
                                {field.label}
                                {field.required && <span className="text-red-400">*</span>}
                              </label>
                              {field.helpText && (
                                <p className="text-[10px] text-amber-400/70 mb-1.5 flex items-start gap-1">
                                  <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                                  {field.helpText}
                                </p>
                              )}
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}

          {/* PREVIEW VIEW */}
          {viewMode === 'preview' && (
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                <div className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-4">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {generateProtocol()}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* REFERENCES VIEW */}
          {viewMode === 'refs' && (
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                <p className="text-xs text-slate-400">
                  Références clés pour la rédaction d&apos;un protocole de revue systématique conforme aux normes PRISMA-P.
                </p>
                {SLR_KEY_REFERENCES.map(ref => (
                  <div key={ref.id} className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-4">
                    <p className="text-xs font-semibold text-white">{ref.citation}</p>
                    <p className="text-xs text-emerald-400/80 mt-1 italic">{ref.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{ref.journal}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-800 px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost" size="sm"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-red-400 h-8"
          >
            Réinitialiser
          </Button>
          <Button
            size="sm"
            onClick={handleCopyProtocol}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? 'Copié !' : 'Copier le protocole'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
