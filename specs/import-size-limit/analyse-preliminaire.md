# Analyse préliminaire — limite d'import effective ~10 Mo vs 20 Mo annoncés

Date : 2026-10-08 · Déclencheur : défaut découvert en recette n° 3 (specs/article-ocr-async/preuves.md : « import original 44 Mo → refus… Request body exceeded 10MB ») · Statut : analyse — zéro code

## 1. Cause racine (sourcée, Next 16.1.3)

- `node_modules/next/dist/server/body-streams.js` : `DEFAULT_BODY_CLONE_SIZE_LIMIT = 10 * 1024 * 1024 // 10MB`. Dans `cloneBodyStream()`, au-delà du plafond : `limitExceeded = true` → `p1.push(null); p2.push(null)` (couches clonées closes) + avertissement « Request body exceeded 10MB … Only the first 10MB will be available unless configured ». Le message est présent aussi dans `server.runtime.prod.js` → le défaut touche le runtime de **production** (`next start`, build Tauri), pas seulement le dev.
- `node_modules/next/dist/server/next-server.js` l.1305-1306 : le plafond consommé est `nextConfig.experimental.proxyClientMaxBodySize` (nombre attendu : comparaison numérique + `bytes.format`).
- `node_modules/next/dist/server/config-schema.js` l.225 : clé valide `proxyClientMaxBodySize` ; l'ancienne `middlewareClientMaxBodySize` (l.224) est **dépréciée** (config.js : « Please use experimental.proxyClientMaxBodySize instead ») — le lien du message d'avertissement est périmé.
- Projet : `next.config.ts` ne définit AUCUN de ces plafonds → le défaut 10 Mo s'applique.

## 2. Conséquences constatées

- Recette n° 3 : PDF réel de 44,2 Mo refusé ; seules des tranches ≤ 9,5 Mo passaient (découpe manuelle pdf-lib) — friction directe pour le propriétaire.
- Le plafond applicatif `MAX_IMPORT_BYTES = 20 Mo` (extraction.ts l.10) est lui-même inférieur au scan réel de 44,2 Mo → à relever.

## 3. Décisions proposées

1. **Transport** : `experimental.proxyClientMaxBodySize: 64 * 1024 * 1024` (64 Mo, nombre) dans `next.config.ts`, commenté — couvre le plafond applicatif + en-têtes multipart + marge. La clé dépréciée n'est PAS utilisée.
2. **Plafond applicatif** : `MAX_IMPORT_BYTES` 20 → **50 Mo** (couvre le scan réel 44,2 Mo ; message d'erreur déjà constant-driven) ; label UI « 20 Mo max » → « 50 Mo max » ; docs § 7 mises à jour.
3. **Honnêteté** : fichier > 50 Mo → refus lisible avant parsing (chemin existant) ; les docs historiques (etude.md/preuves.md du cycle OCR) ne sont pas réécrits.

## 4. Risques

- Mémoire : import 50 Mo → tampon multipart + octets en base ≈ pic ~150-200 Mo transitoire — acceptable (baseline RSS ~1,9 Go, OCR = gros consommateur, pas l'import).
- Cas pathologique body > 64 Mo (transport) : couches clonées closes → erreur de parse lisible côté app — documenté, hors usage réel (fichiers ≤ 50 Mo).
