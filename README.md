# ThesisFrame — Assistant intelligent pour la rédaction de thèses de doctorat

![Version](https://img.shields.io/badge/version-1.1.0-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue)

ThesisFrame est une application web complète qui vous assiste dans toutes les étapes de la rédaction de votre thèse de doctorat : cadrage, rédaction scientifique, gestion des références bibliographiques, planification agile et bien plus.

---

## Installation rapide (Windows)

### Prérequis

1. **Node.js 18+** — [Télécharger ici](https://nodejs.org)
   - Vérifiez : ouvrez un terminal (cmd) et tapez `node --version`

### Installation automatique

1. Téléchargez le code source depuis GitHub :
   - Cliquez sur le bouton vert **"Code"** → **"Download ZIP"**
   - Ou clonez le dépôt : `git clone https://github.com/freemind25/Ma-These.git`

2. **Double-cliquez sur `INSTALL-ET-LANCE.bat`**

C'est tout ! Le script va automatiquement :
- Installer toutes les dépendances
- Compiler l'application
- Démarrer le serveur
- Ouvrir votre navigateur

> ⏱️ Temps estimé : 2-3 minutes (première fois seulement)

### Installation manuelle

Si vous préférez la ligne de commande :

```bash
git clone https://github.com/freemind25/Ma-These.git
cd Ma-These
npm install
npm run build
npm start
```

Puis ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## Utilisation

- **Adresse** : http://localhost:3000
- **Arrêt** : Fermez la fenêtre de terminal ou appuyez sur `Ctrl+C`
- **Relance** : Double-cliquez sur `LANCE.bat` (après la première installation)

---

## Fonctionnalités

| Module | Description |
|--------|-------------|
| **Cadrage** | Structure et cadre de votre recherche |
| **Rédaction IA** | Assistance à la rédaction avec intelligence artificielle |
| **Chapitres** | Gestion et rédaction des chapitres |
| **Références** | Gestion bibliographique (import BibTeX) |
| **Sources** | Base de données de sources de recherche |
| **Planification Agile** | Sprints et stories pour avancer méthodiquement |
| **Journal** | Suivi quotidien de votre progression |

---

## Architecture technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript 5
- **Styles** : Tailwind CSS 4 + shadcn/ui
- **Base de données** : SQLite (Prisma ORM)
- **IA** : Intégration LLM pour l'assistance à la rédaction

---

## Structure du projet

```
Ma-These/
├── src/                    # Code source de l'application
│   ├── app/                # Pages et routes API (Next.js App Router)
│   ├── components/         # Composants React
│   ├── lib/                # Utilitaires et configuration
│   │   ├── corpus/         # Base de connaissances IA
│   │   └── ai/             # Modes de rédaction IA
│   └── store/              # État global (Zustand)
├── prisma/                 # Schéma de base de données
├── db/                     # Base de données SQLite
├── electron/               # Code Electron (pour build desktop)
├── public/                 # Assets statiques
└── scripts/                # Scripts de build
```

---

## Données

Toutes vos données sont stockées dans `db/custom.db` (base SQLite).
- **Sauvegarde** : Copiez `db/custom.db` pour sauvegarder
- **Réinitialisation** : Supprimez `db/custom.db` (recréé automatiquement)

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `"node" n'est pas reconnu` | Installez [Node.js 18+](https://nodejs.org) |
| `Le port 3000 est déjà utilisé` | Changez le PORT dans le fichier `.bat` |
| `Erreur de build` | Supprimez le dossier `.next` et relancez |
| `Le navigateur ne s'ouvre pas` | Ouvrez manuellement http://localhost:3000 |

---

## Licence

ThesisFrame © 2025 — Tous droits réservés.
