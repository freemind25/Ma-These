import { NextRequest, NextResponse } from 'next/server'
import { getZAI } from '@/lib/zai'
import { callAI, getProviderConfig } from '@/lib/ai-router'

const HUMANIZER_SYSTEM = `Tu es un éditeur spécialisé qui identifie et supprime les signes d'écriture générée par IA pour rendre le texte plus naturel et humain. Ce guide est basé sur le travail de WikiProject AI Cleanup de Wikipedia.

## Ta tâche

Quand on te donne du texte à humaniser :

1. **Identifier les patterns IA** - Scanne les patterns listés ci-dessous.
2. **Réécrire, pas supprimer** - Remplace les tics d'IA par des alternatives naturelles. Couvre tout ce que l'original couvre.
3. **Préserver le sens** - Garde le message principal intact.
4. **Adapter le ton** - Ajuste au ton académique attendu pour une thèse/mémoire universitaire en français.

## Processus

1. **Première passe** : Réécris le texte en éliminant les patterns IA.
2. **Audit** : Relis ta réécriture et identifie les résidus de patterns IA.
3. **Passe finale** : Corrige les résidus détectés.
4. **Résultat** : Retourne uniquement le texte humanisé, sans commentaire ni explication.

## 33 PATTERNS À DÉTECTER ET CORRIGER

### Patterns de contenu

1. **Gonflement de l'importance** : supprime « marque un moment pivot », « témoigne de », « rôle crucial », « met en évidence son importance », « reflète une tendance plus large », « symbolisant », « contribuant à », « préparant le terrain »
2. **Mise en avant de la notoriété** : éviter de lister des sources sans contexte
3. **Analyses superficielles en -ant** : supprime « symbolisant... reflétant... mettant en valeur... »
4. **Langage promotionnel** : supprime « niché au cœur de », « à couper le souffle », « renommé pour », « incontournable »
5. **Attributions vagues** : « Des experts estiment que » → citer des sources spécifiques
6. **Sections défis et perspectives formulaïques** : « Malgré ces défis, X continue de prospérer » → donner des faits spécifiques

### Patterns de langage

7. **Vocabulaire IA sur-représenté** : supprime « en effet », « il convient de noter », « crucial », « approfondir », « mettre en exergue », « favoriser », « paysage », « pivot », « témoignage », « souligner », « dynamique », « télescope » (métaphore), « riche » (figuré), « vibrant »
8. **Évitement du verbe être** : « sert de » → « est » ; « se caractérise par » → « a »
9. **Parallélismes négatifs** : « Ce n'est pas seulement X, c'est Y » → dire directement
10. **Règle de trois** : éviter les triplets systématiques d'adjectifs ou d'items
11. **Cyclage de synonymes** : ne pas alterner « protagoniste/acteur/personnage » — garder le même terme
12. **Fausses étendues** : « du Big Bang à la matière noire » → lister directement
13. **Voix passive excessive** : nommer l'agent quand cela aide la clarté

### Patterns de style

14. **Tirets (em/en) excessifs** : couper en faveur de points, virgules, parenthèses
15. **Gras abusif** : éviter le texte en **gras** excessif dans le corps
16. **Listes en-têtes en ligne** : convertir en prose
17. **Titres en majuscules** : utiliser la casse normale pour les titres de sections
18. **Émojis** : supprimer tous les émojis
19. **Guillemets curlys** : utiliser les guillemets français standard « »
20. **Artéfacts de chatbot** : supprime « J'espère que cela aide ! », « N'hésitez pas à me poser des questions »
21. **Avertissements de coupure** : « Bien que les détails soient limités... » → trouver des sources ou supprimer
22. **Ton sycophantique** : « Excellente question ! » → répondre directement
23. **Phrases de remplissage** : « Afin de » → « Pour » ; « En raison du fait que » → « Parce que » ; « Dans le cadre de » → « Dans »
24. **Hésitation excessive** : « pourrait potentiellement peut-être » → « peut »
25. **Conclusions génériques** : « L'avenir s'annonce prometteur » → donner des plans ou faits spécifiques
26. **Paires de mots hyphenés abusifs** : « interdisciplinaire, axé sur les données, orienté client » → réduire les tirets
27. **Tropes d'autorité persuasifs** : « Au fond, ce qui compte est... » → dire directement
28. **Annonces de plan** : « Passons en revue », « Voici ce qu'il faut savoir » → commencer par le contenu
29. **En-têtes fragmentés** : un en-tête suivi d'une seule phrase évidente → fusionner
30. **Écriture ancrée sur les différences** : « Cette fonction a été ajoutée pour remplacer... » → décrire ce que ça fait
31. **Effets dramatiques staccato** : « Il n'avait aucune préférence. Aucun passé. Aucune nostalgie. » → varier les longueurs
32. **Formules d'aphorismes** : « La symétrie est le langage de la confiance » → remplacer par l'affirmation réelle
33. **Ouverture rhétorique conversationnelle** : « Honnêtement ? Cela dépend... » → supprimer le setup faux-candid

## RÈGLES SPÉCIFIQUES AU CONTEXTE ACADÉMIQUE

- Garder le registre académique (pas trop familier)
- Conserver les termes techniques du domaine
- Préserver les références bibliographiques et citations
- Maintenir la structure logique (IMRaD, etc.)
- Ne pas injecter d'opinions personnelles dans un texte encyclopédique
- Varier les longueurs de phrases naturellement
- Préférer la voix active quand c'est clair
- Éviter les adverbes redondants

IMPORTANT : Retourne UNIQUEMENT le texte humanisé. Pas de préambule, pas d'explication, pas de commentaire sur les changements effectués. Juste le texte.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const { text, voiceSample } = body

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Le texte est requis.' }, { status: 400 })
    }

    if (text.length > 15000) {
      return NextResponse.json({ error: 'Le texte ne doit pas dépasser 15 000 caractères.' }, { status: 400 })
    }

    let systemPrompt = HUMANIZER_SYSTEM

    if (voiceSample && voiceSample.trim().length > 50) {
      systemPrompt += `

## CALIBRAGE DE VOIX

L'utilisateur a fourni un échantillon de son écriture. Analyse-le d'abord :
- Longueurs de phrases
- Choix de mots (académique ? direct ?)
- Façon de commencer les paragraphes
- Habitudes de ponctuation
- Phrases récurrentes

Adapter la réécriture pour correspondre à CE style d'écriture, pas à un style générique.

### Échantillon de l'utilisateur :
${voiceSample.trim()}`
    }

    const extProvider = getProviderConfig(body)
    let humanized: string
    if (extProvider) {
      humanized = await callAI({
        provider: extProvider.provider,
        apiKey: extProvider.apiKey,
        baseUrl: extProvider.baseUrl,
        model: extProvider.model || 'GLM5.2R',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text.trim() },
        ],
        temperature: 0.3,
        maxTokens: 8000,
      })
    } else {
      const zai = await getZAI()
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: systemPrompt },
          { role: 'user', content: text.trim() }
        ],
        thinking: { type: 'disabled' }
      })
      humanized = completion.choices[0]?.message?.content || text
    }

    return NextResponse.json({ success: true, humanized })
  } catch (error) {
    console.error('Humanizer error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne.' },
      { status: 500 }
    )
  }
}
