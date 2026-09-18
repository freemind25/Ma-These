# Tasks — veille-raccourci-vu

Contexte : mandat du propriétaire « go pour les deux propositions » (2026-09-18). Spec : `specs/veille-raccourci-vu/spec.md` — touche « M », portée vue détail, gardes input/modificateurs. Cycle complet (hors voie rapide : ~30-40 lignes > seuil 20).

## Groupe A — Frontend / UI

- [x] T1 — Dans `src/modules/veille-academique/veille-academique-page.tsx` (composant `VeilleDetail`) : monter un listener `window` `keydown` (démonté avec la vue) qui, sur « m » sans Ctrl/Cmd/Alt et hors `input`/`textarea`/`[contenteditable]`, appelle le `markSeen()` existant si `unreadCount > 0` et aucun marquage en cours (CA-1.1, CA-1.2, CA-1.3, CA-1.5) ; ajouter l'indice `<kbd>M</kbd>` au bouton « Tout marquer comme vu » (CA-1.4) — aucune autre modification du fichier · preuve attendue : rendu navigateur (marquage au clavier, garde du champ de renommage, état 0 non-vu sans requête), captures desktop + mobile dans `test-snapshots/`, `bun run lint` 0 erreur, `bun run test:run` 63 fichiers / 1444 tests verts · **recetté (« go », 2026-09-18) : les 5 CA prouvés en navigateur (preuves.md § 3), lint 0 erreur baseline 230, suite 1444 verte — commit `c8b1ca7`**

Dépendances : aucune.

---

Dépendances globales : groupe unique. Un groupe : annonce → feu vert → exécution → preuves → commit → compte rendu → recette (rythme global applicable si le propriétaire le demande, comme sur `veille-academique`).
