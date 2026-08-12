'use client'

import { useState, useEffect, useCallback } from 'react'
import { KeyRound, Loader2, CheckCircle2, XCircle, Shield, GraduationCap, Crown, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ActivationStatus = {
  activated: boolean
  licenseType?: string
  licenseTypeLabel?: string
  expiresAt?: string
  reason?: string
}

export default function LicenseActivation({
  onActivated,
}: {
  onActivated: (info: ActivationStatus) => void
}) {
  const [keyInput, setKeyInput] = useState('')
  const [deviceName, setDeviceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  // Check existing activation on mount
  useEffect(() => {
    fetch('/api/auth/status')
      .then((r) => r.json())
      .then((data: ActivationStatus) => {
        if (data.activated) {
          onActivated(data)
        }
        setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [])

  const formatKey = useCallback((value: string) => {
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 18)
    const parts = [clean.slice(0, 2), clean.slice(2, 6), clean.slice(6, 10), clean.slice(10, 14), clean.slice(14, 18)]
    return parts.filter(Boolean).join('-')
  }, [])

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKey(e.target.value)
    setKeyInput(formatted)
    setError('')
  }

  const handleActivate = async () => {
    // Ensure TF- prefix
    const fullKey = keyInput.startsWith('TF-') ? keyInput : `TF-${keyInput}`
    
    if (fullKey.replace(/-/g, '').length < 16) {
      setError('Clé incomplète')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: fullKey, deviceName: deviceName || undefined }),
      })
      const data = await res.json()

      if (data.success) {
        onActivated({
          activated: true,
          licenseType: data.licenseType,
          licenseTypeLabel: data.licenseType,
          expiresAt: data.expiresAt,
        })
      } else {
        setError(data.error || data.debug || 'Erreur lors de l\'activation')
      }
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) handleActivate()
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ThesisFrame</h1>
          <p className="text-muted-foreground text-sm">Assistant intelligent pour la rédaction de thèses</p>
        </div>

        {/* Activation Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Activer votre licence</CardTitle>
            <CardDescription>
              Entrez votre numéro de série pour accéder à ThesisFrame
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Key Input */}
            <div className="space-y-2">
              <label htmlFor="license-key" className="text-sm font-medium">
                Numéro de série
              </label>
              <Input
                id="license-key"
                placeholder="TF-XXXX-XXXX-XXXX-XXXX"
                value={keyInput}
                onChange={handleKeyChange}
                onKeyDown={handleKeyDown}
                className="font-mono text-center text-lg tracking-widest h-12"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={loading}
              />
            </div>

            {/* Device Name */}
            <div className="space-y-2">
              <label htmlFor="device-name" className="text-sm font-medium text-muted-foreground">
                Nom de l&apos;appareil <span className="text-xs">(optionnel)</span>
              </label>
              <Input
                id="device-name"
                placeholder="MacBook Pro, Bureau université..."
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Activate Button */}
            <Button
              className="w-full h-11 text-base"
              onClick={handleActivate}
              disabled={loading || keyInput.replace(/-/g, '').length < 16}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification en cours...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Activer la licence
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* License Types Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border p-3 text-xs">
            <Timer className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium">Essai</p>
              <p className="text-muted-foreground">7 jours, 1 appareil</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3 text-xs">
            <GraduationCap className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium">Académique</p>
              <p className="text-muted-foreground">1 an, 2 appareils</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3 text-xs">
            <Shield className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium">Standard</p>
              <p className="text-muted-foreground">Illimitée, 3 appareils</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-3 text-xs">
            <Crown className="h-4 w-4 text-amber-500" />
            <div>
              <p className="font-medium">Premium</p>
              <p className="text-muted-foreground">Illimitée, 5 appareils</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Contactez votre administrateur pour obtenir une clé de licence.
        </p>
      </div>
    </div>
  )
}
