'use client'

interface ChapterEditorProps {
  content: string
  onChange: (content: string) => void
  chapterNumber: string
  chapterTitle: string
}

export default function ChapterEditor({ content, onChange, chapterNumber, chapterTitle }: ChapterEditorProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex-1 overflow-hidden bg-white">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full resize-none border-0 focus:outline-none p-6 sm:p-10 text-[15px] leading-[1.8] font-serif text-slate-800 bg-white placeholder:text-slate-300"
          placeholder={`Commencez la rédaction du Chapitre ${chapterNumber || 'I'}. ${chapterTitle || ''}...\n\nCe que vous écrivez ici EST le texte de votre thèse.`}
          spellCheck
        />
      </div>
    </div>
  )
}
