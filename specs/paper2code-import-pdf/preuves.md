# Preuves — Paper2Code import PDF

Environnement : clone /home/z/Ma-These @ 6b4869a (branche fix/c2-ecarts), dev server
`bunx next dev -p 3001` (port 3000 occupé par le sandbox my-project).

## Groupe A — Backend (T1)

### curl 200 — PDF textuel réel du dépôt (CA-1.1 serveur)

```
$ curl -s -X POST -F "file=@docs/NOTE-PRESENTATION.pdf;type=application/pdf" \
    http://localhost:3001/api/paper2code/extract-pdf | python3 -c …
pages: 5 | chars: 7331 | warnings: 1
texte[0:180]: N O T E D E P R É S E N T A T I O N Ma ThèseMa Thèse De l'idée àDe l'idée à
              l'impactl'impact Plateforme IA de rédaction de thèses et mémoires universitaires
```

### curl 413 — fichier 51 Mo (CA-1.5)

```
$ dd if=/dev/zero of=/tmp/big.pdf bs=1M count=51 + entête %PDF-1.4
HTTP 413
{"error":"Fichier trop volumineux : 51.0 Mo reçus (maximum 50 Mo)."}
```

### curl 415 — TXT renommé .pdf (magic bytes, CA-1.4 serveur)

```
HTTP 415
{"error":"Le contenu du fichier ne correspond pas à un PDF valide (fichier corrompu ou renommé ?)."}
```

### curl 415 — .txt en extension directe

```
HTTP 415
{"error":"Format non pris en charge : « doc.txt ». Ce module accepte uniquement un fichier PDF (article scientifique)."}
```

### curl 400 — POST sans fichier (après correctif formData try/catch)

```
HTTP 400
{"error":"Aucun fichier reçu (champ « file »)."}
```

### curl 200 — PDF avec page vide (détection scanné, CA-1.3 serveur)

PDF de test généré (jspdf, 2 pages, page 2 sans texte) :

```
pages: 2 | chars: 283
warnings[0]: PDF partiellement scanné : 1 page(s) sans texte extractible (pages 2).
             Ces pages sont absentes du texte importé — vérifiez qu'aucune section clé
             (methodologie, hyperparam...
CA-1.3 warning scanne present: True
HTTP 200
```

### Écart rate-limit découvert et corrigé (preuve du mécanisme)

4 requêtes curl successives → `429 {"error":"Trop de requêtes.","message":"Limite atteinte.
Réessayez dans 287s."}` : la règle préexistante `^\/api\/paper2code` (5 req/5 min,
`src/lib/rate-limit.ts` l.57, dimensionnée pour la génération IA) capturait l'import.
Correctif appliqué (règle dédiée 12 req/1 min placée avant, first match wins) →
`RE-CA1 : 200` confirmé après rechargement.

## Groupe B — Frontend (T2)

### `bun run lint`

```
✖ 252 problems (0 errors, 252 warnings)
```

Aucun nouveau warning sur `paper2code-page.tsx` (l.132/135/170 = préexistants, code
d'origine) ni sur `extract-pdf/route.ts` (aucune entrée).

### `bun run test:run`

```
Test Files  2 failed | 79 passed (81)
     Tests  3 failed | 1694 passed (1697)
```

Les 3 échecs sont les préexistants documentés (releases 1.10.20/21, hors périmètre) :
`chapters/[id]/route.test.ts` ×2 (db error mocks) + `ai-types.test.ts` (20 vs 21 providers).
Aucun test nouveau cassé.

### Recette navigateur réelle (agent-browser, http://localhost:3001)

1. Recherche « Article » → clic « Article → Code » → module ouvert : heading + zone
   « Importer un article PDF » + textarea + « Generer le code » désactivé (garde < 200).
2. Upload réel `/home/z/Ma-These/docs/NOTE-PRESENTATION.pdf` via input file :
   - textarea rempli (longueur JS `7331` — identique au `chars` de l'API) ;
   - badge vert « NOTE-PRESENTATION.pdf · 5 page(s) · 7.331 caracteres » + bouton « Retirer » ;
   - « Generer le code » **activé** (e108, plus disabled) ;
   - capture : `test-snapshots/paper2code-import-pdf-recette.png`.
3. Clic « Retirer le fichier importé » : badge supprimé, **textarea préservé (7331)**
   (le chercheur garde son texte) ; input file re-caché ensuite.
4. Upload d'un .txt (forcé via CDP) : toast rouge « Format non pris en charge : " doc.txt ". Ce… »,
   aucun badge, textarea inchangé ; capture :
   `test-snapshots/paper2code-import-pdf-rejet-txt.png`.
5. Console navigateur : aucune erreur liée au module (l'app a chargé proprement ;
   `agent-browser errors` vide pendant les interactions du module).

### Instabilité environnementale constatée (préexistante, hors périmètre)

Le dev server 3001 a crashé deux fois avec des timeouts Prisma `P1008` provenant du
**worker de jobs** (`src/lib/jobs/worker.ts` l.57 `db.job.findFirst`), avant tout appel au
module testé ; relances réussies. Une trace du log montre aussi un
`POST /api/paper2code/extract-pdf 200 in 1208ms` suivi du crash — le crash vient du worker
(async job polling), pas de la route (qui a répondu). À investiguer dans un cycle dédié si
cela persiste en recette propriétaire.
