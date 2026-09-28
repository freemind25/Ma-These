# Preuves — ai-types-provider-count

Date : 2026-09-18 · voie rapide · 1 fichier (`src/lib/ai/ai-types.test.ts`)

## Avant correctif — échec live (preuve du symptôme)

Commande : `bun run test:run src/lib/ai/ai-types.test.ts`

```
    121|     expect(DYNAMIC_MODEL_PROVIDERS).toHaveLength(18);
       |                                     ^
    122|   });
    123| });

 Test Files  1 failed (1)
      Tests  1 failed | 38 passed (39)
   Start at  06:56:51
   Duration  185ms (transform 38ms, setup 0ms, import 51ms, tests 15ms, environment 0ms)

error: script "test:run" exited with code 1
```

## Vérification préalable — comptage et unicité du catalogue

Commande : `bun -e` (import de `src/lib/ai/ai-types.ts`)

```
count: 20
unique: 20
["mistral","routesme","custom","openrouter","groq","cerebras","huggingface","nvidia",
 "cloudflare","github","siliconflow","routeway","ainative","aion","requesty","sealion",
 "tokenrouter","google","cohere","omniroute"]
inconnus du catalogue: []
```

```
ALL_PROVIDER_IDS: 26
providers dans catégories: 26 | orphelins (hors catégories): []
hors dynamique: ["zai","openai","anthropic","pollinations","kilo","kiraai"]
```

## Vérification préalable — historique git

```
=== HISTORIQUE ai-types.ts / test : un seul commit de contenu ===
1359333 0b1ffc11-… (2026-09-15) — catalogue (20 entrées) ET assertion 18 créés ensemble
6463078 9e237e95-… (2026-09-16) — test : mode uniquement (100644 → 100755), 0 ligne
=== APINEX dans le catalogue ? ===
git log -S 'apinex' -- src/lib/ai/ai-types.ts  →  (aucun commit)
```

## Après correctif — test ciblé

Commande : `bun run test:run src/lib/ai/ai-types.test.ts`

```
 RUN  v4.1.11 /home/z/my-project

 ✓ src/lib/ai/ai-types.test.ts (39 tests) 12ms

 Test Files  1 passed (1)
      Tests  39 passed (39)
   Start at  06:57:52
   Duration  179ms (transform 48ms, setup 0ms, import 62ms, tests 12ms, environment 0ms)
```

## Après correctif — suite complète

Commande : `bun run test:run`

```
 Test Files  62 passed (62)
      Tests  1428 passed (1428)
   Start at  06:57:53
   Duration  13.94s
```

Suite intégralement verte (précédemment : 1 failed | 1427 passed) — aucun nouvel échec introduit.
