# Étude — OCR des pages scannées + exécution asynchrone (article scientifique)

Cycle d'étude exigé à l'ouverture de l'option C (consigné dans `docs/ARCHITECTURE-CONNAISSANCE.md` § 7 bis et `specs/article-scientifique/preuves-option-a.md` : « OCR + jobs async différés explicitement — cycle d'étude dédié exigé »). Ce document est **une étude, pas une implémentation** : zéro code modifié. Point d'arrêt en § 7.

## 1. État réel constaté (chemins + lignes vérifiés)

| Constat | Preuve |
|---|---|
| L'extraction PDF actuelle est **texte uniquement** (unpdf `extractText`) | `src/lib/articles/extraction.ts` l.76-82 |
| Les pages sans texte (< 10 car.) sont détectées et **ignorées**, avec limite honnête « L'OCR n'est pas disponible dans cette itération » | même fichier, `detectScannedPages` l.97-105 et `buildLimits` l.122-130 |
| Le modèle `ImportedDoc` stocke texte/pages/limites/`scanned` mais **pas les octets du fichier** | `prisma/schema.prisma` l.397-411 ; route d'import : buffer transitoire l.47, `importedDoc.create` sans octets l.103-118 (`src/app/api/article-imports/route.ts`) |
| L'infrastructure **async existe déjà et est complète** : file persistante en base (verrou optimiste, reprise des orphelins), worker démarré au boot (`instrumentation.ts` → `startJobWorker`), tick 3 s, registre de handlers (`noop`, `deep-research`, `veille-check`), API `POST`/`GET /api/jobs` | `src/lib/jobs/queue.ts` (106 l.), `src/lib/jobs/worker.ts` l.25-54, l.133-174, `src/instrumentation.ts`, `src/app/api/jobs/route.ts` l.8-9, l.54-58 |
| unpdf installé (v1.8.1) exporte **`extractImages`** : bitmaps décodés (`Uint8ClampedArray` + width/height/channels) **sans canvas** — les décodeurs image de pdf.js (JPEG, JPX, JBIG2) sont pure JS/WASM | `node_modules/unpdf/dist/index.d.mts` l.189-192 ; README unpdf § `extractImages` l.239-257 |
| unpdf exporte aussi `renderPageAsImage` mais en Node il exige `@napi-rs/canvas` (option `canvasImport`) = **binaire natif précompilé** | `node_modules/unpdf/dist/index.d.mts` l.2, l.72-88 ; README unpdf l.307-331 |
| tesseract.js et un encodeur PNG pur JS ne sont **pas installés** | `bun pm ls` (aucun résultat tesseract/pngjs) |
| Box 4 Go, OOM confirmé (2 next-server tués à ~2 Go RSS) — contournement documenté | `FICHE_SYNTHESE.md` session 2026-10-07 ; dmesg consigné au worklog |

## 2. Verdict de viabilité

**OCR pure JS : viable**, sous conditions. Un PDF scanné est typiquement composé d'une image pleine page par page — inutile de rastériser. La chaîne candidate :

```
extractImages(pdf, page)  →  bitmap décodé (pure JS)
  →  encodage PNG (lib pure JS, zéro natif)
  →  tesseract.js recognize (WASM, worker unique séquentiel)
  →  texte + confiance  →  ImportedDoc.text (bloc marqué) + limits mise à jour
```

**Async : quasi gratuit** — il reste à écrire un handler (`article-import-ocr`) dans le registre `HANDLERS`, l'enfilement au retour d'import, et le suivi UI. Toute la mécanique (persistance, reprise après crash, verrou, API de suivi) est déjà livrée et recettée par le deep-research et la veille.

## 3. Options

| Option | Description | Verdict |
|---|---|---|
| **1 — OCR serveur pure JS (extractImages + tesseract.js)** | Chaîne § 2 côté serveur Node ; `tesseract.js` en WASM (aucun natif) ; worker séquentiel 1 page à la fois avec libération mémoire ; langues `fra`, `eng`, `ara` embarquées localement (tessdata, pas de téléchargement runtime) | **Recommandée** |
| 2 — Rastérisation `renderPageAsImage` + `@napi-rs/canvas` | Plus robuste pour les PDF à rendu complexe, mais **binaire natif** dans le build Tauri Windows (risque packaging CI, contigu à la contrainte pure JS du cahier des charges) | Écartée |
| 3 — OCR côté webview (pdf.js canvas + tesseract.js navigateur) | Zéro dépendance serveur, mais logique dupliquée, mémoire dans la webview, et incompatible avec le modèle de job (l'onglet doit rester ouvert) — contredit l'exigence async | Écartée |

## 4. Complément de schéma nécessaire (option 1)

`ImportedDoc` ne conserve pas les octets : un OCR **différé** exige de relire le fichier. Proposition : colonne `data Bytes?` (nullable — remplie uniquement pour les imports PDF, plafond 20 Mo existant `MAX_IMPORT_BYTES` l.10). App mono-utilisateur locale : les octets restent en base locale, aucune réplication. Alternative réjetée : re-téléversement au lancement de l'OCR (friction, fichier perdu à la fermeture).

## 5. Spec proposée pour le cycle d'implémentation (à valider)

**US-1** — En tant que doctorant, je veux lancer un OCR sur les pages d'un PDF importé reconnues sans texte, afin d'exploiter un mémoire scanné sans le retaper.
- CA-1.1 Étant donné un PDF importé avec pages détectées « scannées », quand je clique « Lancer l'OCR », alors un job est créé (statut visible pending → running → done/failed) et l'UI affiche la progression par page.
- CA-1.2 Étant donné un job OCR terminé, alors le texte obtenu est inséré dans le document importé dans un **bloc distinct et marqué** (« texte OCR — relecture requise »), avec la confiance moyenne rapportée, sans écraser le texte existant.
- CA-1.3 Étant donné un texte OCR produit, alors la limite « scanned » est mise à jour (pages résolues / restantes) et la traçabilité par section peut le citer comme source avec mention OCR.
- CA-1.4 Étant donné n'importe quel contenu OCR, il est traité **exclusivement comme données** (même règle anti-injection que le document importé) — jamais comme instructions pour les prompts.
- CA-1.5 Étant donné une exécution OCR, le worker traite **1 page à la fois** et libère le moteur entre les pages ; un plafond de pages par job (défaut : 30, configurable) est appliqué et annoncé ; un seul job OCR actif à la fois (garde anti-empilement, même motif que veille l.96-104).
- CA-1.6 Étant donné une machine hors ligne, l'OCR fonctionne : les données de langue (fra, eng, ara) sont embarquées localement, aucun téléchargement à l'exécution.
- CA-1.7 Étant donné un job OCR, il reprend après redémarrage du serveur (comportement existant de la file) ou échoue avec message lisible.

**Hors périmètre** : correction automatique du texte OCR ; OCR de PDF vectoriels (inutile — texte déjà extractible) ; interfaces de retouche d'image ; détection de langue automatique (langue choisie à l'UI) ; traduction du texte OCR dans le même job.

## 6. Risques

1. **Cas limites d'`extractImages`** : plusieurs images par page, masques, CMYK, JBIG2 rarement produits. Mitigation : banc d'essai réel (PDF du pack URBANIS-DZ + PDF scanné de synthèse + 1-2 scans réels fournis par le propriétaire), pages restées illisibles → limite honnête plutôt que texte fantôme.
2. **Mémoire (OOM box confirmée)** : tesseract WASM peut consommer plusieurs centaines de Mo par page. Mitigation : séquentiel strict + `terminate` entre pages + plafond + recette avec mesure RSS (critère de recette explicite).
3. **Précision variable** selon qualité du scan : honnêteté avant tout — confiance affichée, relecture humaine exigée, bloc marqué, jamais fusionné silencieusement avec le texte natif.
4. **Taille de l'installateur Tauri** : tessdata ajoute quelques Mo par langue — chiffrer précisément au moment du plan (mesure sur les fichiers réels, pas d'estimation).

## 7. Point d'arrêt

- **Décision 1** : lancer le cycle d'implémentation OCR/async selon la spec § 5 (option 1) ? (~1-2 cycles, ~2-3 groupes : Schéma → Backend/IA → UI/Recette)
- **Décision 2** : maintenir en veilleuse (l'étude reste consignée, la limite honnête actuelle « OCR non disponible » continue de s'afficher) ?
- Toute exécution reste bloquée jusqu'à validation explicite (Constitution — autorisation avant modification).
