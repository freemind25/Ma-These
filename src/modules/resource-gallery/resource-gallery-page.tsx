'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  ImageIcon,
  Layers,
  Microscope,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ZoomIn,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  RB_RESOURCES,
  RESOURCE_CATEGORIES,
  type ResourceImage,
} from '@/data/rb-resources'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  Microscope,
  Building2,
}

function getCategoryBadgeClasses(category: 'methodologie' | 'urbanisme'): string {
  if (category === 'methodologie') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
  }
  return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
}

function getCategoryLabel(category: 'methodologie' | 'urbanisme'): string {
  if (category === 'methodologie') return 'Méthodologie'
  return 'Urbanisme'
}

export function ResourceGalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<ResourceImage | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredResources = useMemo(() => {
    if (selectedCategory === 'all') return RB_RESOURCES
    return RB_RESOURCES.filter((r) => r.category === selectedCategory)
  }, [selectedCategory])

  const openImage = useCallback((resource: ResourceImage) => {
    setSelectedImage(resource)
    setDialogOpen(true)
  }, [])

  const navigateImage = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedImage) return
      const currentIndex = filteredResources.findIndex(
        (r) => r.id === selectedImage.id
      )
      if (currentIndex === -1) return
      if (direction === 'prev') {
        const nextIndex =
          currentIndex === 0 ? filteredResources.length - 1 : currentIndex - 1
        setSelectedImage(filteredResources[nextIndex])
      } else {
        const nextIndex =
          currentIndex === filteredResources.length - 1 ? 0 : currentIndex + 1
        setSelectedImage(filteredResources[nextIndex])
      }
    },
    [selectedImage, filteredResources]
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!dialogOpen) return
      if (e.key === 'Escape') {
        setDialogOpen(false)
        setSelectedImage(null)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateImage('prev')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateImage('next')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dialogOpen, navigateImage])

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* ── Header ── */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/15 text-chart-1">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Ressources visuelles
            </h1>
            <p className="text-sm text-muted-foreground">
              Infographies académiques — Méthodologie et Urbanisme
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit text-xs font-medium">
          {RB_RESOURCES.length} ressources
        </Badge>
      </header>

      <Separator />

      {/* ── Category Filter ── */}
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer par catégorie">
        {RESOURCE_CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon]
          const isActive = selectedCategory === cat.id
          const shortLabel =
            cat.id === 'all'
              ? 'Toutes'
              : cat.id === 'methodologie'
                ? 'Méthodologie'
                : 'Urbanisme'
          return (
            <Button
              key={cat.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={
                isActive
                  ? 'shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }
              aria-pressed={isActive}
            >
              {IconComponent && <IconComponent className="w-4 h-4 mr-1.5" />}
              {shortLabel}
            </Button>
          )
        })}
      </nav>

      {/* ── Image Grid ── */}
      {filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <AlertCircle className="w-10 h-10" />
          <p className="text-sm font-medium">
            Aucune ressource ne correspond à ce filtre.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card
              key={resource.id}
              className="group overflow-hidden border-border/60 bg-card transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/5 hover:scale-[1.01] hover:border-border"
            >
              <CardHeader
                className="p-0 relative cursor-pointer"
                onClick={() => openImage(resource)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={resource.src}
                    alt={resource.title}
                    className="w-full h-auto object-cover rounded-t-lg max-h-64 transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <Badge
                    className={[
                      'absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 pointer-events-none shadow-sm',
                      getCategoryBadgeClasses(resource.category),
                    ].join(' ')}
                  >
                    {getCategoryLabel(resource.category)}
                  </Badge>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-t-lg flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity duration-300 drop-shadow-lg" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-2.5 p-4">
                <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed line-clamp-3">
                  {resource.description}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-fit mt-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => openImage(resource)}
                >
                  <ZoomIn className="w-3.5 h-3.5 mr-1.5" />
                  Voir en grand
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Lightbox Dialog ── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedImage(null)
        }}
      >
        <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 overflow-hidden">
          {selectedImage && (
            <div>
              <div className="relative bg-muted/30">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />

                {filteredResources.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="pointer-events-auto ml-3 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/95"
                      onClick={(evt) => {
                        evt.stopPropagation()
                        navigateImage('prev')
                      }}
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="pointer-events-auto mr-3 h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background/95"
                      onClick={(evt) => {
                        evt.stopPropagation()
                        navigateImage('next')
                      }}
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col gap-3">
                <DialogHeader className="gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={[
                        'text-[10px] font-semibold px-2 py-0.5',
                        getCategoryBadgeClasses(selectedImage.category),
                      ].join(' ')}
                    >
                      {getCategoryLabel(selectedImage.category)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {filteredResources.findIndex((r) => r.id === selectedImage.id) + 1}{' '}
                      / {filteredResources.length}
                    </span>
                  </div>
                  <DialogTitle className="text-lg font-semibold leading-snug">
                    {selectedImage.title}
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-relaxed">
                    {selectedImage.description}
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
