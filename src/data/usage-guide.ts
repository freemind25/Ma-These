export interface GuideExample {
  title: string
  steps: string[]  // each step is a didactic instruction
  tip?: string     // optional tip shown in amber
}

export interface GuideSection {
  id: string
  title: string
  icon: string  // lucide icon name as string
  description: string
  color: 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'teal' | 'slate'
  examples: GuideExample[]
}

export const GUIDE_COLORS: Record<string, { light: string; text: string; bg: string; border: string; accent: string }> = {
  emerald: {
    light: 'bg-emerald-50',
    text: 'text-emerald-700',
    bg: 'bg-emerald-100/60',
    border: 'border-emerald-200',
    accent: 'text-emerald-600',
  },
  sky: {
    light: 'bg-sky-50',
    text: 'text-sky-700',
    bg: 'bg-sky-100/60',
    border: 'border-sky-200',
    accent: 'text-sky-600',
  },
  amber: {
    light: 'bg-amber-50',
    text: 'text-amber-700',
    bg: 'bg-amber-100/60',
    border: 'border-amber-200',
    accent: 'text-amber-600',
  },
  violet: {
    light: 'bg-violet-50',
    text: 'text-violet-700',
    bg: 'bg-violet-100/60',
    border: 'border-violet-200',
    accent: 'text-violet-600',
  },
  rose: {
    light: 'bg-rose-50',
    text: 'text-rose-700',
    bg: 'bg-rose-100/60',
    border: 'border-rose-200',
    accent: 'text-rose-600',
  },
  teal: {
    light: 'bg-teal-50',
    text: 'text-teal-700',
    bg: 'bg-teal-100/60',
    border: 'border-teal-200',
    accent: 'text-teal-600',
  },
  slate: {
    light: 'bg-slate-50',
    text: 'text-slate-700',
    bg: 'bg-slate-100/60',
    border: 'border-slate-200',
    accent: 'text-slate-600',
  },
}

export const USAGE_GUIDE_SECTIONS: GuideSection[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. DÉMARRAGE RAPIDE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'demarrage-rapide',
    title: 'Démarrage rapide',
    icon: 'Rocket',
    description:
      'Premiers pas avec ThesisFrame pour débuter votre thèse efficacement. Découvrez l\'interface, la navigation par chapitres et les fondamentaux de la rédaction.',
    color: 'emerald',
    examples: [
      {
        title: 'Premiers pas avec ThesisFrame',
        steps: [
          'Ouvrez ThesisFrame dans votre navigateur. L\'application charge automatiquement votre dernière session de travail.',
          'Sur la gauche, la barre latérale affiche les chapitres de votre thèse. Cliquez sur « Introduction » pour ouvrir ce chapitre dans l\'éditeur.',
          'L\'éditeur central s\'affiche : commencez à taper votre texte directement. Le contenu est sauvegardé automatiquement à chaque modification.',
          'Pour créer un nouveau chapitre, cliquez sur le bouton « + » en bas de la barre latérale, puis nommez-le (ex. : « Chapitre 1 – Cadre théorique »).',
          'Naviguez entre les chapitres en cliquant sur leurs onglets ou dans la liste de la barre latérale pour structurer votre travail.',
        ],
        tip: 'Votre travail est sauvegardé localement dans le navigateur. Pour ne rien perdre, configurez rapidement une sauvegarde cloud (voir section « Comptes cloud & Stockage »).',
      },
      {
        title: 'Comprendre la disposition en 3 colonnes',
        steps: [
          'La colonne de GAUCHE est la barre latérale : elle contient la structure de votre thèse (chapitres, parties), les modèles et les outils rapides.',
          'La colonne CENTRALE est l\'éditeur de texte principal : c\'est là que vous rédigez. Vous pouvez basculer entre le mode riche (WYSIWYG) et le mode Markdown.',
          'La colonne de DROITE est le panneau d\'aide : il regroupe l\'Assistant IA, le Directeur IA, la recherche documentaire, les références et les outils d\'écriture.',
          'Pour masquer ou afficher un panneau, cliquez sur les icônes de chevron (‹ / ›) situées sur les bordures des colonnes.',
          'Sur mobile, les panneaux se superposent. Utilisez les boutons de la barre d\'outils supérieure pour basculer entre l\'éditeur et les outils.',
        ],
        tip: 'Vous pouvez redimensionner les colonnes en glissant les séparateurs. Une disposition plus large pour l\'éditeur facilite la rédaction prolongée.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. ÉDITEUR DE TEXTE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'editeur-texte',
    title: 'Éditeur de texte',
    icon: 'PenTool',
    description:
      'Maîtrisez l\'éditeur intégré : modes riche et Markdown, raccourcis clavier, assistance IA inline et dictée vocale pour une rédaction fluide.',
    color: 'sky',
    examples: [
      {
        title: 'Basculer entre mode riche et texte brut',
        steps: [
          'Dans la barre d\'outils de l\'éditeur, repérez le bouton de bascule situé à droite (icône représentant un basculement de mode ou « Markdown »).',
          'Cliquez dessus pour passer du mode riche (WYSIWYG avec mise en forme visuelle) au mode Markdown (texte brut avec balises).',
          'En mode riche, utilisez la barre de formatage pour appliquer des styles : gras, italique, titres, listes, citations, etc.',
          'En mode Markdown, tapez directement les balises (ex. : `# Titre`, `**gras**`, `> citation`) pour un contrôle précis de la mise en forme.',
          'Re-basculez en mode riche pour prévisualiser le rendu final de vos balises Markdown.',
        ],
        tip: 'Le mode Markdown est idéal pour les utilisateurs habitués à LaTeX ou pour copier-coller du contenu depuis d\'autres outils académiques.',
      },
      {
        title: 'Utiliser les raccourcis clavier essentiels',
        steps: [
          'Appuyez sur `Ctrl+S` (ou `Cmd+S` sur Mac) pour forcer une sauvegarde manuelle de votre travail. Un indicateur visuel confirme la sauvegarde.',
          'Utilisez `Ctrl+Shift+[` pour réduire la section courante et `Ctrl+Shift+]` pour la déplier, afin de naviguer plus facilement dans un long chapitre.',
          'Pour annuler une action, `Ctrl+Z` ; pour rétablir, `Ctrl+Shift+Z`. L\'historique est conservé par session.',
          'Utilisez `Ctrl+B` pour le gras, `Ctrl+I` pour l\'italique et `Ctrl+K` pour insérer un lien hypertexte.',
          'Appuyez sur `Tab` pour indenter une liste à puces et `Shift+Tab` pour désindenter.',
        ],
        tip: 'Consultez la liste complète des raccourcis en survolant les boutons de la barre d\'outils — les infobulles affichent le raccourci associé.',
      },
      {
        title: 'Utiliser le menu IA inline dans l\'éditeur',
        steps: [
          'Sélectionnez un passage de texte dans l\'éditeur : un paragraphe, une phrase ou même un mot.',
          'Un petit bouton IA apparaît à côté de votre sélection (flottant). Cliquez dessus pour ouvrir le menu IA inline.',
          'Dans le menu déroulant, choisissez une action : « Améliorer le style », « Simplifier », « Rendre plus académique », « Traduire », « Développer » ou « Résumer ».',
          'L\'IA traite votre texte et affiche une proposition. Examinez la suggestion dans le panneau de prévisualisation.',
          'Cliquez sur « Appliquer » pour remplacer votre sélection par le texte généré, ou sur « Ignorer » pour conserver votre texte original.',
        ],
        tip: 'Le menu IA inline fonctionne avec le fournisseur configuré dans les paramètres IA. Vérifiez que votre clé API est active avant de l\'utiliser.',
      },
      {
        title: 'Dicter votre texte à voix haute',
        steps: [
          'Dans la barre d\'outils de l\'éditeur, cliquez sur l\'icône microphone (🎤) située à droite de la barre de formatage.',
          'Votre navigateur vous demande l\'autorisation d\'utiliser le microphone. Cliquez sur « Autoriser ».',
          'L\'icône du microphone devient rouge, indiquant que l\'enregistrement est actif. Parlez naturellement — le texte s\'insère en temps réel à la position du curseur.',
          'Prononcez la ponctuation à voix haute (ex. : « point », « virgule », « point d\'interrogation ») pour qu\'elle soit insérée automatiquement.',
          'Cliquez à nouveau sur le microphone ou appuyez sur `Ctrl+Shift+M` pour arrêter la dictée.',
        ],
        tip: 'Pour une meilleure reconnaissance, utilisez un microphone de bonne qualité et parlez dans un environnement calme. La dictée fonctionne mieux en français avec les navigateurs modernes (Chrome, Edge).',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. ASSISTANT IA & DIRECTEUR
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'assistant-ia-directeur',
    title: 'Assistant IA & Directeur',
    icon: 'Brain',
    description:
      'Exploitez l\'intelligence artificielle pour vous assister dans la rédaction, obtenir des retours structurés du Directeur IA et dialoguer en contexte avec votre texte.',
    color: 'violet',
    examples: [
      {
        title: 'Demander de l\'aide à l\'Assistant IA',
        steps: [
          'Dans le panneau de droite, cliquez sur l\'onglet « Assistant IA ». Une interface de chat s\'affiche.',
          'En haut du chat, un menu déroulant vous permet de choisir un mode spécialisé : « Rédaction scientifique », « Revue de littérature », « Méthodologie », « Analyse de données » ou « Général ».',
          'Sélectionnez le mode adapté à votre besoin. Par exemple, choisissez « Revue de littérature » pour obtenir de l\'aide sur l\'organisation de vos lectures.',
          'Tapez votre question dans le champ de saisie : ex. « Comment structurer ma revue de littérature en sciences de l\'éducation ? »',
          'L\'IA génère une réponse détaillée avec des recommandations concrètes. Vous pouvez copier des passages utiles directement dans votre éditeur.',
        ],
        tip: 'Plus votre question est précise, meilleure sera la réponse. N\'hésitez pas à fournir le contexte de votre recherche (discipline, objet d\'étude, méthodologie) pour des réponses ciblées.',
      },
      {
        title: 'Obtenir une évaluation du Directeur IA',
        steps: [
          'Dans le panneau de droite, cliquez sur l\'onglet « Directeur IA ». Cet outil simule les retours d\'un directeur de thèse.',
          'Sélectionnez le chapitre que vous souhaitez faire évaluer dans le menu déroulant (ou le texte actif de l\'éditeur est utilisé par défaut).',
          'Cliquez sur le bouton « Soumettre pour évaluation ». Le Directeur IA analyse votre texte selon plusieurs critères académiques.',
          'Lisez le retour structuré qui s\'affiche : chaque critère (clarté, argumentation, méthodologie, citations, style) reçoit une note et des commentaires spécifiques.',
          'Utilisez les suggestions pour améliorer votre chapitre directement dans l\'éditeur, puis soumettez à nouveau pour vérifier vos corrections.',
        ],
        tip: 'Le Directeur IA ne remplace pas votre vrai directeur de thèse, mais il vous aide à identifier les faiblesses avant une soumission formelle.',
      },
      {
        title: 'Utiliser le Chat IA dans le panneau latéral',
        steps: [
          'Ouvrez le panneau de droite et cliquez sur l\'onglet « IA ». Le chat contextuel s\'affiche avec le contenu de votre chapitre actif en contexte.',
          'En haut, sélectionnez le mode d\'assistance : « Rédaction scientifique » pour de l\'aide à la rédaction, « Revue de littérature » pour synthétiser des sources, ou « Méthodologie » pour des conseils de protocole.',
          'Posez votre question en tenant compte du contexte de votre chapitre. Ex. : « Mon section 2.3 manque de transition avec la section suivante, propose-moi un paragraphe de liaison. »',
          'L\'IA répond en tenant compte du texte environnant. Vous pouvez ensuite insérer la suggestion directement dans l\'éditeur.',
          'Enchaînez les questions pour affiner la réponse. L\'historique de conversation est conservé pendant la session.',
        ],
        tip: 'Le chat IA contextuel est plus pertinent lorsque votre chapitre contient déjà du contenu — il peut alors s\'y référer pour des suggestions cohérentes.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. CONFIGURATION IA & CLÉS API
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'configuration-ia',
    title: 'Configuration IA & Clés API',
    icon: 'Settings',
    description:
      'Configurez les fournisseurs d\'IA (OpenAI, Mistral, Anthropic, Ollama, etc.), gérez vos clés API et activez les services de recherche académique.',
    color: 'amber',
    examples: [
      {
        title: 'Utiliser le fournisseur Z.ai (par défaut)',
        steps: [
          'ThesisFrame est configuré par défaut avec le fournisseur Z.ai. Aucune configuration supplémentaire n\'est nécessaire pour commencer.',
          'Ouvrez l\'Assistant IA ou le Chat IA dans le panneau de droite et commencez à poser vos questions immédiatement.',
          'Le fournisseur Z.ai offre un quota de requêtes gratuit. Pour un usage intensif (rédaction longue, analyses répétées), envisagez de connecter votre propre fournisseur.',
        ],
        tip: 'Le fournisseur Z.ai est idéal pour découvrir les fonctionnalités IA de ThesisFrame. Pour un usage régulier et illimité, connectez votre propre clé API.',
      },
      {
        title: 'Connecter OpenAI (GPT-4o)',
        steps: [
          'Dans le panneau de droite, ouvrez l\'onglet « IA » puis cliquez sur l\'icône ⚙️ (Paramètres IA) en haut du panneau.',
          'Dans la section « Fournisseur », sélectionnez « OpenAI » dans le menu déroulant.',
          'Rendez-vous sur https://platform.openai.com/api-keys pour créer une clé API. Connectez-vous à votre compte OpenAI, cliquez sur « Create new secret key » et copiez la clé.',
          'Collez votre clé API dans le champ « Clé API » de ThesisFrame. L\'URL de base (https://api.openai.com/v1) est pré-remplie automatiquement.',
          'Sélectionnez le modèle souhaité dans le menu déroulant (ex. : gpt-4o, gpt-4o-mini). Cliquez sur « Enregistrer » pour valider.',
        ],
        tip: 'Gardez votre clé API secrète et ne la partagez jamais. Si vous la perdez, révoquez-la sur la plateforme OpenAI et créez-en une nouvelle.',
      },
      {
        title: 'Connecter Mistral AI',
        steps: [
          'Ouvrez les Paramètres IA (⚙️ dans l\'onglet IA du panneau droit).',
          'Sélectionnez « Mistral » dans le menu déroulant des fournisseurs.',
          'Rendez-vous sur https://console.mistral.ai/api-keys/ pour obtenir votre clé API. Créez un compte si nécessaire, puis cliquez sur « Create new key ».',
          'Collez la clé dans le champ « Clé API ». L\'URL de base (https://api.mistral.ai/v1) et le modèle recommandé (mistral-large-latest) sont pré-remplis.',
          'Cliquez sur « Enregistrer ». Testez la connexion en envoyant un message dans le Chat IA.',
        ],
        tip: 'Mistral AI offre des modèles performants en français. Le modèle « mistral-large-latest » est recommandé pour la rédaction académique francophone.',
      },
      {
        title: 'Connecter Anthropic Claude',
        steps: [
          'Dans les Paramètres IA (⚙️), sélectionnez « Anthropic » comme fournisseur.',
          'Rendez-vous sur https://console.anthropic.com/ pour créer un compte et générer une clé API dans la section « API Keys ».',
          'Copiez votre clé Anthropic et collez-la dans le champ « Clé API » de ThesisFrame.',
          'Le modèle (claude-sonnet-4-20250514) et l\'URL de base sont pré-remplis automatiquement.',
          'Cliquez sur « Enregistrer ». Claude est particulièrement performant pour l\'analyse critique et la révision de textes académiques.',
        ],
        tip: 'Anthropic propose un modèle « Claude Haiku » plus rapide et moins coûteux, adapté aux tâches simples. Réservez « Claude Sonnet » pour les analyses complexes.',
      },
      {
        title: 'Utiliser Ollama en local',
        steps: [
          'Dans les Paramètres IA (⚙️), sélectionnez « Ollama » dans le menu des fournisseurs.',
          'L\'URL de base est pré-remplie avec http://localhost:11434. Vérifiez que Ollama est installé et en cours d\'exécution sur votre machine.',
          'Si Ollama n\'est pas installé, téléchargez-le depuis https://ollama.com et installez-le. Lancez ensuite un modèle avec la commande `ollama pull llama3` dans votre terminal.',
          'Dans ThesisFrame, sélectionnez le modèle disponible (ex. : llama3, mistral, mixtral) dans le menu déroulant des modèles.',
          'Cliquez sur « Enregistrer ». Vos requêtes IA seront traitées localement, sans envoi de données vers un serveur externe.',
        ],
        tip: 'Ollama fonctionne entièrement en local — vos données de thèse ne quittent jamais votre machine. C\'est idéal pour les recherches confidentielles. Assurez-vous que votre machine a suffisamment de RAM (8 Go minimum pour llama3).',
      },
      {
        title: 'Utiliser FreeLLMAPI (gratuit)',
        steps: [
          'Dans les Paramètres IA (⚙️), sélectionnez « FreeLLMAPI » dans le menu des fournisseurs.',
          'Si ce n\'est pas déjà fait, installez le serveur FreeLLMAPI sur votre machine en exécutant la commande suivante dans votre terminal : `curl -fsSL https://freellmapi.dev/install.sh | bash`',
          'L\'URL de base est pré-remplie automatiquement. Sélectionnez le modèle souhaité dans le menu déroulant.',
          'Cliquez sur « Enregistrer ». Le service gratuit offre un nombre limité de requêtes par jour, suffisant pour un usage modéré.',
        ],
        tip: 'FreeLLMAPI est une excellente option si vous n\'avez pas de budget pour une clé API payante. Les performances peuvent varier selon le modèle choisi et la charge du service.',
      },
      {
        title: 'Ajouter une clé Semantic Scholar',
        steps: [
          'Dans les Paramètres IA (⚙️), faites défiler jusqu\'à la section « Services de recherche ».',
          'Repérez la section « Semantic Scholar » et le champ « Clé API Semantic Scholar ».',
          'Rendez-vous sur https://www.semanticscholar.org/product/api#api-key pour demander une clé API gratuite. Remplissez le formulaire avec votre nom et votre adresse e-mail institutionnelle.',
          'Recevez votre clé par e-mail (généralement instantanément). Copiez-la et collez-la dans le champ prévu dans ThesisFrame.',
          'Cliquez sur « Enregistrer ». Vous pouvez maintenant effectuer des recherches documentaires sans limites de taux.',
        ],
        tip: 'Sans clé Semantic Scholar, vos recherches sont limitées à 100 requêtes par seconde et vous risquez des erreurs 429 (trop de requêtes). La clé est gratuite et permet un accès plus fiable au service.',
      },
      {
        title: 'Ajouter une clé Consensus AI',
        steps: [
          'Dans les Paramètres IA (⚙️), repérez la section « Services de recherche » et trouvez le champ « Clé API Consensus ».',
          'Rendez-vous sur https://consensus.app et créez un compte pour obtenir votre clé API.',
          'Une fois connecté, accédez à votre tableau de bord pour récupérer la clé API.',
          'Collez la clé dans le champ « Clé API Consensus » de ThesisFrame et cliquez sur « Enregistrer ».',
          'L\'onglet « Consensus » dans la recherche documentaire est maintenant activé et vous permet d\'interroger plus de 220 millions d\'articles scientifiques.',
        ],
        tip: 'La clé Consensus AI est nécessaire pour utiliser l\'onglet de recherche Consensus dans le panneau de recherche documentaire. Sans clé, cet onglet reste désactivé.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. COMPTES CLOUD & STOCKAGE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cloud-stockage',
    title: 'Comptes cloud & Stockage',
    icon: 'Cloud',
    description:
      'Connectez vos services cloud préférés pour sauvegarder, synchroniser et partager votre thèse en toute sécurité.',
    color: 'teal',
    examples: [
      {
        title: 'Connecter Google Drive',
        steps: [
          'Dans la barre latérale gauche, cliquez sur « Sauvegarde cloud » ou l\'icône ☁️.',
          'Dans le panneau qui s\'ouvre, cliquez sur le bouton « Se connecter avec Google ».',
          'Une fenêtre d\'autorisation Google s\'ouvre. Sélectionnez votre compte Google et autorisez ThesisFrame à accéder à votre Google Drive.',
          'Après autorisation, sélectionnez le dossier de destination dans votre Drive (ou créez un nouveau dossier « Ma Thèse »).',
          'Cliquez sur « Sauvegarder maintenant » pour exporter votre thèse vers Google Drive. Vous pouvez configurer une sauvegarde automatique régulière.',
        ],
        tip: 'Activez la sauvegarde automatique (toutes les 30 minutes par exemple) pour ne jamais perdre votre travail. Vérifiez régulièrement que la sauvegarde s\'effectue correctement.',
      },
      {
        title: 'Connecter Box Cloud Storage',
        steps: [
          'Dans le panneau « Sauvegarde cloud », cliquez sur « Box Cloud ».',
          'Vous devez configurer une application Box : rendez-vous sur https://app.box.com/developers/console pour créer une application Custom App.',
          'Récupérez le « Client ID » et le « Client Secret » de votre application Box et saisissez-les dans les champs prévus dans ThesisFrame.',
          'Cliquez sur « Autoriser » pour lancer le flux OAuth. Connectez-vous à votre compte Box et autorisez l\'accès.',
          'Une fois connecté, vous pouvez télécharger (upload) et télécharger (download) les fichiers de votre thèse depuis Box.',
        ],
        tip: 'Box Cloud est particulièrement utilisé dans les environnements universitaires. Vérifiez avec votre institution si un compte Box est déjà mis à votre disposition.',
      },
      {
        title: 'Connecter Mendeley pour les références',
        steps: [
          'Dans le panneau de droite, ouvrez l\'onglet « Références » puis cliquez sur le sous-onglet « Mendeley ».',
          'Cliquez sur « Se connecter à Mendeley ». Une fenêtre d\'autorisation OAuth s\'ouvre.',
          'Connectez-vous à votre compte Mendeley (ou créez-en un sur https://www.mendeley.com si nécessaire) et autorisez l\'accès.',
          'Une fois connecté, votre bibliothèque Mendeley s\'affiche. Sélectionnez les références à importer en cochant les cases.',
          'Cliquez sur « Importer » pour ajouter les références sélectionnées à votre bibliothèque locale dans ThesisFrame.',
        ],
        tip: 'L\'importation Mendeley récupère les métadonnées complètes (auteurs, titre, année, journal, DOI). Vos références importées sont disponibles pour les citations dans l\'éditeur.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. OUTILS DE RÉDACTION
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'outils-redaction',
    title: 'Outils de rédaction',
    icon: 'PencilRuler',
    description:
      'Améliorez la qualité de votre texte avec la vérification grammaticale, le linting stylistique, l\'auto-édition multicritères et les exercices de déblocage.',
    color: 'rose',
    examples: [
      {
        title: 'Vérifier la grammaire avec LanguageTool',
        steps: [
          'Dans le panneau de droite, ouvrez l\'onglet « Outils » puis cliquez sur « Grammaire (LT) ».',
          'Le texte de votre chapitre actif est automatiquement chargé dans l\'outil. Cliquez sur le bouton « Analyser ».',
          'LanguageTool analyse votre texte et affiche la liste des erreurs détectées : fautes d\'orthographe, accords, conjugaison, typographie, etc.',
          'Chaque erreur est présentée avec sa localisation dans le texte, la règle grammaticale concernée et une suggestion de correction.',
          'Cliquez sur une erreur pour la voir surlignée dans le texte, puis sur « Corriger » pour appliquer automatiquement la suggestion. Vous pouvez aussi corriger manuellement.',
        ],
        tip: 'LanguageTool fonctionne particulièrement bien en français. Passez l\'analyse avant chaque soumission de chapitre à votre directeur pour un texte impeccable.',
      },
      {
        title: 'Améliorer le style avec Harper',
        steps: [
          'Dans les « Outils » du panneau droit, cliquez sur « Harper » (linting stylistique).',
          'Cliquez sur le bouton « Linter ». Harper analyse votre texte pour détecter les problèmes de style : phrases trop longues, répétitions, voix passive excessive, jargon inutile.',
          'Parcourez les suggestions une par une. Chaque suggestion inclut une explication du problème et une proposition d\'amélioration.',
          'Cliquez sur « Appliquer » pour accepter une suggestion ou « Ignorer » pour la rejeter. Certaines suggestions peuvent être modifiées avant application.',
          'Relancez le linter après avoir appliqué des corrections pour vérifier qu\'aucun nouveau problème n\'est apparu.',
        ],
        tip: 'Harper est complémentaire à LanguageTool : LT corrige la grammaire, Harper améliore le style. Utilisez-les en séquence pour un texte à la fois correct et élégant.',
      },
      {
        title: 'Auto-édition selon les 8 critères',
        steps: [
          'Ouvrez les « Outils » et cliquez sur « Auto-édition 8C ». Cet outil propose 8 critères d\'évaluation pour votre chapitre.',
          'Les 8 critères s\'affichent sous forme de liste à cocher : clarté, cohérence, complétude, concision, crédibilité, correction, cohésion et convention.',
          'Pour chaque critère, cliquez sur le bouton « Évaluer ». L\'IA analyse votre texte spécifiquement pour ce critère et fournit un diagnostic détaillé.',
          'Un indicateur de progression (barre ou pourcentage) vous montre combien de critères ont été évalués et le score global.',
          'Travaillez sur les critères les plus faibles en premier. Après correction, réévaluez pour suivre votre progression.',
        ],
        tip: 'L\'auto-édition 8C est un excellent exercice avant de soumettre un chapitre. Elle vous force à examiner votre texte sous 8 angles différents et à repérer des faiblesses que vous auriez ignorées.',
      },
      {
        title: 'Débloquer l\'écriture',
        steps: [
          'Ouvrez les « Outils » du panneau droit et cliquez sur « Déblocage écriture ». Cet outil vous aide à surmonter le syndrome de la page blanche.',
          'Choisissez un type d\'exercice : « Freewriting » (écriture libre), « Prompt créatif », « Questions de départ » ou « Reformulation ».',
          'L\'outil vous présente un prompt ou une consigne. Par exemple, en mode « Freewriting » : « Écrivez pendant 5 minutes sans vous arrêter sur le sujet suivant... »',
          'Rédigez votre texte dans la zone de saisie. Ne vous souciez pas de la qualité — l\'objectif est de relancer votre flux d\'écriture.',
          'Une fois l\'exercice terminé, cliquez sur « Insérer dans l\'éditeur » pour récupérer le texte généré et le retravailler dans votre chapitre.',
        ],
        tip: 'Le déblocage d\'écriture est particulièrement utile le matin avant de commencer votre journée de rédaction. Même 10 minutes de freewriting peuvent débloquer une journée de travail.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. RECHERCHE DOCUMENTAIRE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'recherche-documentaire',
    title: 'Recherche documentaire',
    icon: 'Search',
    description:
      'Trouvez et importez des articles scientifiques, utilisez la recherche IA Consensus, analysez un champ de recherche et identifiez des journaux open access.',
    color: 'slate',
    examples: [
      {
        title: 'Rechercher des articles scientifiques',
        steps: [
          'Dans le panneau de droite, ouvrez l\'onglet « Recherche litt. » (Recherche documentaire).',
          'En haut du panneau, choisissez la source de recherche : « Semantic Scholar » (par défaut), « DOI », « CrossRef » ou « ArXiv ».',
          'Dans la barre de recherche, saisissez votre requête. Utilisez des termes précis : ex. « deep learning medical image segmentation 2023 » ou « apprentissage profond segmentation imagerie médicale ».',
          'Cliquez sur « Rechercher » ou appuyez sur `Entrée`. Les résultats s\'affichent sous forme de liste avec le titre, les auteurs, l\'année et la revue.',
          'Cliquez sur un résultat pour voir le résumé (abstract). Cliquez ensuite sur « Importer comme référence » pour l\'ajouter à votre bibliographie.',
        ],
        tip: 'Combinez des termes en anglais et en français pour élargir vos résultats. Utilisez les guillemets pour les expressions exactes et l\'opérateur AND pour affiner.',
      },
      {
        title: 'Utiliser Consensus pour une recherche IA',
        steps: [
          'Dans le panneau « Recherche litt. », cliquez sur l\'onglet « Consensus ». (Nécessite une clé API Consensus configurée au préalable.)',
          'Saisissez votre question de recherche en langage naturel : ex. « Le mindfulness réduit-il significativement les symptômes de l\'anxiété chez les adolescents ? »',
          'Cliquez sur « Rechercher ». Consensus interroge sa base de plus de 220 millions d\'articles scientifiques et synthétise les résultats.',
          'Lisez la réponse synthétique générée par l\'IA, qui inclut les résultats principaux, le niveau de consensus et les références citées.',
          'Cliquez sur « Importer les références » pour ajouter automatiquement les articles cités dans la réponse à votre bibliographie.',
        ],
        tip: 'Consensus est idéal pour les revues de littérature rapides. Formulez des questions précises et fermées (avec un verbe d\'action) pour obtenir les meilleures synthèses.',
      },
      {
        title: 'Analyser un champ de recherche',
        steps: [
          'Dans les « Outils » du panneau droit, cliquez sur « Analyse champ rech. » (Analyse de champ de recherche).',
          'Saisissez le thème de votre champ de recherche : ex. « intelligence artificielle appliquée à l\'éducation supérieure ».',
          'Cliquez sur « Lancer l\'analyse ». L\'outil exécute 9 requêtes structurées séquentiellement pour cartographier le champ : définition, auteurs clés, tendances, lacunes, etc.',
          'Chaque résultat intermédiaire s\'affiche au fur et à mesure. Vous pouvez suivre la progression dans la barre d\'avancement.',
          'À la fin, consultez le rapport complet qui synthétise les 9 dimensions de votre champ de recherche. Exportez-le ou copiez les éléments utiles.',
        ],
        tip: 'L\'analyse de champ de recherche est parfaite pour le chapitre d\'introduction de votre thèse. Elle vous aide à positionner votre travail dans le paysage scientifique existant.',
      },
      {
        title: 'Trouver un journal open access',
        steps: [
          'Dans les « Outils », cliquez sur « Journaux OA » (Journaux Open Access).',
          'Entrez le sujet de votre article : ex. « bioinformatique computationnelle » ou « pédagogie universitaire numérique ».',
          'Cliquez sur « Rechercher ». Une liste de journaux open access compatibles s\'affiche avec leurs caractéristiques.',
          'Utilisez les filtres pour affiner les résultats : triez par APC (frais de publication) pour trouver des journaux gratuits ou peu coûteux.',
          'Consultez les détails de chaque journal (facteur d\'impact, délai de publication, type de licence) pour choisir le plus adapté à votre publication.',
        ],
        tip: 'Vérifiez toujours que le journal est bien indexé dans les bases de données reconnues (Scopus, Web of Science). Un bon journal OA n\'est pas nécessairement payant — de nombreux journaux de qualité sont gratuits pour les auteurs.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. RÉFÉRENCES BIBLIOGRAPHIQUES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'references-bibliographiques',
    title: 'Références bibliographiques',
    icon: 'BookOpen',
    description:
      'Gérez votre bibliographie : ajoutez des références manuellement, importez depuis BibTeX et vérifiez les métadonnées via DOI.',
    color: 'emerald',
    examples: [
      {
        title: 'Ajouter une référence manuellement',
        steps: [
          'Dans le panneau de droite, ouvrez l\'onglet « Références ».',
          'Cliquez sur le bouton « + Ajouter une référence ». Un formulaire de saisie s\'affiche.',
          'Remplissez les champs obligatoires : auteurs (ex. : Dupont, J. et Martin, L.), titre de l\'article, année de publication, nom du journal.',
          'Complétez les champs optionnels : volume, numéro de page, DOI (ex. : 10.1038/s41586-023-05735-z), mots-clés.',
          'Cliquez sur « Enregistrer ». La référence apparaît dans votre liste bibliographique et peut être citée dans vos chapitres.',
        ],
        tip: 'Entrez toujours le DOI quand il est disponible — cela permet de vérifier automatiquement les métadonnées et de générer des liens cliquables dans vos exports PDF.',
      },
      {
        title: 'Importer des références depuis BibTeX',
        steps: [
          'Dans l\'onglet « Références », cliquez sur le bouton « Import BibTeX ».',
          'Une zone de texte s\'affiche. Ouvrez votre fichier .bib dans un éditeur de texte, copiez tout son contenu et collez-le dans cette zone.',
          'Alternativement, collez une entrée BibTeX individuelle : ex. `@article{dupont2023, author={Dupont, J.}, title={...}, ...}`.',
          'Cliquez sur « Parser et importer ». ThesisFrame analyse le contenu BibTeX et extrait les métadonnées de chaque entrée.',
          'Vérifiez les références importées dans la liste. Les erreurs de parsing sont signalées en rouge — corrigez-les manuellement si nécessaire.',
        ],
        tip: 'Vous pouvez exporter votre bibliographie Zotero, Mendeley ou EndNote au format BibTeX puis l\'importer ici. C\'est le moyen le plus rapide de migrer une bibliothèque existante.',
      },
      {
        title: 'Vérifier une référence avec DOI',
        steps: [
          'Dans l\'onglet « Références », repérez le champ de recherche par DOI en haut du panneau.',
          'Collez un identifiant DOI dans le champ : ex. `10.1126/science.abc1234`. Le DOI commence toujours par « 10. ».',
          'Cliquez sur « Rechercher » ou appuyez sur `Entrée`. ThesisFrame interroge l\'API CrossRef pour récupérer les métadonnées complètes de l\'article.',
          'Les champs du formulaire se remplissent automatiquement : auteurs, titre, année, journal, volume, pages, ISSN.',
          'Vérifiez les informations récupérées, ajustez si nécessaire, puis cliquez sur « Enregistrer » pour ajouter la référence à votre bibliothèque.',
        ],
        tip: 'La recherche par DOI est le moyen le plus fiable d\'ajouter une référence sans erreur. Si un article a un DOI, privilégiez toujours cette méthode plutôt que la saisie manuelle.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 9. EXPORT & FORMATS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'export-formats',
    title: 'Export & Formats',
    icon: 'FileOutput',
    description:
      'Exportez votre thèse en PDF avec mise en page professionnelle, en Word (.docx) pour un travail collaboratif, ou en LaTeX pour une composition typographique avancée.',
    color: 'sky',
    examples: [
      {
        title: 'Exporter en PDF',
        steps: [
          'Dans la barre latérale ou la barre d\'outils, cliquez sur « Export PDF ».',
          'Configurez les options de mise en page : format du papier (A4 par défaut), marges (haut, bas, gauche, droite), et orientation (portrait/paysage).',
          'Sélectionnez le chapitre à exporter (chapitre actif ou thèse complète).',
          'Cliquez sur « Générer le PDF ». ThesisFrame utilise Paged.js pour composer le document avec une mise en page professionnelle (en-têtes, pieds de page, numérotation).',
          'Le fichier PDF est généré et téléchargé automatiquement. Ouvrez-le pour vérifier le rendu final avant impression ou soumission.',
        ],
        tip: 'Pour les thèses francophones, vérifiez que les marges correspondent aux exigences de votre établissement (généralement 2,5 cm à gauche pour la reliure et 2 cm ailleurs).',
      },
      {
        title: 'Exporter en Word (.docx)',
        steps: [
          'Cliquez sur « Export Word/PPT » dans la barre d\'outils ou la barre latérale.',
          'Choisissez le format « Word (.docx) » dans les options d\'export.',
          'Sélectionnez la portée : chapitre actuel ou thèse entière.',
          'Cliquez sur « Générer ». Le fichier .docx est créé avec la mise en forme préservée (titres, listes, tableaux, images).',
          'Le fichier est téléchargé automatiquement. Ouvrez-le dans Microsoft Word ou LibreOffice Writer pour des modifications ultérieures.',
        ],
        tip: 'L\'export Word est utile pour partager vos chapitres avec votre directeur de thèse ou vos co-auteurs qui n\'utilisent pas ThesisFrame. Le format est également accepté par la plupart des plateformes de soumission.',
      },
      {
        title: 'Générer du code LaTeX',
        steps: [
          'Dans les options d\'export, choisissez le format « LaTeX (.tex) ».',
          'Sélectionnez les chapitres à inclure et les options de composition.',
          'Cliquez sur « Générer ». ThesisFrame convertit votre contenu en code LaTeX, avec les balises appropriées pour les titres, sections, citations et références.',
          'Le fichier .tex est téléchargé. Ouvrez-le dans un éditeur LaTeX (Overleaf, TeXstudio) pour le compiler.',
          'Le template LaTeX généré est compatible avec les normes de thèses francophones (classe `these` ou `memoir` adaptée).',
        ],
        tip: 'Si vous devez soumettre votre thèse au format LaTeX imposé par votre université, utilisez l\'export LaTeX comme base et adaptez le préambule aux exigences de votre établissement.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 10. STRUCTURE & TEMPLATES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'structure-templates',
    title: 'Structure & Templates',
    icon: 'LayoutTemplate',
    description:
      'Organisez la structure de votre thèse avec des modèles prédéfinis, gérez les chapitres et les parties, et personnalisez votre plan.',
    color: 'violet',
    examples: [
      {
        title: 'Appliquer un modèle de structure',
        steps: [
          'En bas de la barre latérale gauche, cliquez sur « Modèles » (icône de gabarit).',
          'Une galerie de modèles s\'affiche avec 3 options principales : « IMRaD » (Introduction, Méthodes, Résultats, Discussion), « Thématique » (organisation par thèmes) et « Articles » (compilation d\'articles).',
          'Lisez la description de chaque modèle pour choisir celui qui correspond au format de votre thèse. Le modèle IMRaD est le plus courant en sciences expérimentales.',
          'Cliquez sur « Appliquer » sous le modèle choisi. Les chapitres prédéfinis sont créés automatiquement dans votre structure.',
          'Personnalisez les titres des chapitres générés en cliquant sur leur nom dans la barre latérale et en les renommant.',
        ],
        tip: 'Vous pouvez appliquer un modèle à tout moment, même si vous avez déjà commencé à écrire. Les chapitres existants sont conservés et les nouveaux chapitres du modèle sont ajoutés.',
      },
      {
        title: 'Basculer entre mode chapitres et mode parties',
        steps: [
          'Dans la section « Structure » de la barre latérale, repérez le bouton de bascule « Chapitres / Parties ».',
          'Par défaut, votre thèse est en mode « Chapitres » (structure plate). Cliquez sur le bouton pour basculer en mode « Parties ».',
          'En mode Parties, vous pouvez regrouper vos chapitres sous des parties (ex. : « Partie I – Fondements théoriques » contenant les chapitres 1, 2 et 3).',
          'Pour créer une partie, cliquez sur « + Nouvelle partie » et nommez-la. Glissez-déposez ensuite les chapitres dans la partie correspondante.',
          'Re-basculez en mode Chapitres pour revenir à une vue plate si vous préférez.',
        ],
        tip: 'Le mode Parties est utile pour les thèses longues (plus de 5 chapitres) car il permet de structurer visuellement votre travail en grandes sections logiques.',
      },
      {
        title: 'Ajouter un chapitre',
        steps: [
          'Cliquez sur le bouton « + » situé en bas de la liste des chapitres dans la barre latérale.',
          'Une boîte de dialogue vous demande le nom du chapitre. Saisissez un titre clair : ex. « Chapitre 4 – Résultats de l\'étude qualitative ».',
          'Cliquez sur « Créer ». Le nouveau chapitre apparaît dans la liste et un onglet correspondant s\'ouvre dans l\'éditeur.',
          'Alternativement, faites un clic droit sur la barre d\'onglets de l\'éditeur et sélectionnez « Nouveau chapitre ».',
          'Commencez à rédiger immédiatement dans le nouveau chapitre.',
        ],
        tip: 'Nommez vos chapitres de façon descriptive dès leur création — cela facilitera la navigation et l\'export ultérieur. Vous pouvez toujours les renommer plus tard.',
      },
      {
        title: 'Réorganiser les chapitres',
        steps: [
          'Dans la barre latérale, survolez un chapitre pour afficher les poignées de glissement (icône ⋮⋮ ou poignée à gauche du nom).',
          'Cliquez et glissez le chapitre vers le haut ou le bas pour le déplacer dans l\'ordre souhaité. Un indicateur visuel montre la position d\'insertion.',
          'Relâchez le bouton de la souris pour déposer le chapitre à sa nouvelle position. L\'ordre des onglets dans l\'éditeur se met à jour automatiquement.',
          'Alternativement, utilisez les flèches haut/bas (▲ ▼) qui apparaissent au survol du chapitre pour le déplacer d\'une position à la fois.',
          'En mode Parties, vous pouvez également glisser des chapitres d\'une partie à une autre.',
        ],
        tip: 'L\'ordre des chapitres dans la barre latérale détermine l\'ordre dans vos exports PDF et Word. Vérifiez l\'ordre final avant d\'exporter votre thèse complète.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 11. OUTILS AVANCÉS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'outils-avances',
    title: 'Outils avancés',
    icon: 'Wrench',
    description:
      'Accédez aux outils avancés : diagrammes Excalidraw, composition APA, protocole SLR PRISMA-P, boîte doctorale, livres-compétences et planification agile.',
    color: 'amber',
    examples: [
      {
        title: 'Créer un diagramme avec Excalidraw',
        steps: [
          'Dans les « Outils » du panneau droit, cliquez sur « Diagrammes ». Un canevas Excalidraw s\'ouvre.',
          'Utilisez la barre d\'outils Excalidraw pour dessiner : sélectionnez des formes (rectangles, ellipses, flèches), ajoutez du texte, et connectez les éléments.',
          'Dessinez votre cadre conceptuel : placez vos variables, concepts et hypothèses sous forme de boîtes et reliez-les avec des flèches orientées.',
          'Personnalisez les couleurs et les styles pour distinguer les différents types d\'éléments (variables indépendantes en bleu, dépendantes en orange, etc.).',
          'Cliquez sur « Sauvegarder comme image » pour exporter votre diagramme en PNG. Vous pouvez ensuite l\'insérer dans vos chapitres.',
        ],
        tip: 'Les diagrammes Excalidraw sont idéaux pour les cadres conceptuels, les modèles théoriques et les organigrammes de méthodologie. Le style « dessin à main levée » est apprécié dans les présentations académiques.',
      },
      {
        title: 'Composer des résultats statistiques au format APA',
        steps: [
          'Dans les « Outils », cliquez sur « APA Results Composer » (Composition de résultats APA).',
          'Sélectionnez le type de test statistique que vous souhaitez rapporter : test t, ANOVA, régression, corrélation, chi-carré, etc.',
          'Remplissez les champs avec vos valeurs statistiques : valeur t ou F, degrés de liberté (ddl), valeur p, taille de l\'effet (d, η², r²), etc.',
          'Cliquez sur « Générer ». L\'outil produit le texte formaté selon les normes APA 7e édition, en français.',
          'Copiez le texte généré et collez-le dans votre chapitre de résultats. La mise en forme (italiques, symboles) est préservée.',
        ],
        tip: 'L\'outil APA vérifie automatiquement la cohérence de vos valeurs (ex. : signalement si p est rapporté comme « > .05 » mais que l\'effet est décrit comme significatif).',
      },
      {
        title: 'Rédiger un protocole SLR (PRISMA-P)',
        steps: [
          'Dans les « Outils », cliquez sur « Outils SLR » (Systematic Literature Review).',
          'L\'interface affiche les 11 sections du protocole PRISMA-P : titre, registre, justification, objectifs, critères d\'inclusion/exclusion, sources d\'information, stratégie de recherche, gestion des données, sélection des études, extraction des données, synthèse des données.',
          'Remplissez chaque section une par une. L\'outil vous guide avec des consignes et des exemples pour chaque champ.',
          'Pour la section « Stratégie de recherche », l\'outil vous aide à formuler votre chaîne de recherche booléenne (ex. : ("machine learning" OR "deep learning") AND ("education" OR "learning")).',
          'Cliquez sur « Prévisualiser le Markdown » pour voir le rendu complet de votre protocole. Exportez-le en PDF ou copiez le Markdown.',
        ],
        tip: 'Le protocole PRISMA-P doit idéalement être enregistré sur un registre comme PROSPERO avant de commencer votre revue systématique. Utilisez cet outil pour préparer le contenu avant l\'enregistrement.',
      },
      {
        title: 'Utiliser la Boîte doctorale',
        steps: [
          'Dans les « Outils », cliquez sur « Boîte doctorale ». Cet outil regroupe 3 ressources essentielles pour le doctorant.',
          'Onglet 1 — « Checklist de lecture » : une grille structurée pour analyser systématiquement chaque article que vous lisez (méthodologie, résultats, limites, pertinence pour votre recherche).',
          'Onglet 2 — « Phrases académiques » : une banque de phrases types organisées par fonction (introduire un argument, citer un auteur, exprimer un désaccord, transition, etc.) pour enrichir votre écriture.',
          'Onglet 3 — « Guide du cadre conceptuel » : un tutoriel pas à pas pour construire et justifier votre cadre théorique, avec des exemples concrets.',
        ],
        tip: 'Utilisez la checklist de lecture pour chaque article que vous lisez — cela vous fera gagner un temps considérable lors de la rédaction de votre revue de littérature. Remplissez-la systématiquement dès la première lecture.',
      },
      {
        title: 'Explorer les compétences des livres',
        steps: [
          'Dans les « Outils », cliquez sur « Livres-compétences ». Cet outil vous donne accès à des extraits de connaissances tirés de livres de référence.',
          'Parcourez la liste des livres disponibles. Utilisez les onglets de filtre (Tous, Rédaction, Méthodologie, etc.) pour trouver les livres pertinents.',
          'Pour chaque livre, développez la fiche pour voir les cadres, principes, techniques et pièges extraits. Cliquez sur l\'icône livre pour l\'activer (max. 3 livres simultanés).',
          'Les livres activés injectent automatiquement leurs connaissances dans le Directeur IA — il pourra référencer les cadres par nom dans ses retours.',
          'Les livres avec un badge « Pertinent chap. X » sont particulièrement utiles pour le chapitre en cours d\'édition.',
        ],
        tip: 'Les livres-compétences couvrent des ouvrages reconnus en rédaction académique et en méthodologie de recherche. C\'est une ressource précieuse pour les doctorants en formation.',
      },
      {
        title: 'Importer votre propre livre (nouveau)',
        steps: [
          'Dans le panneau « Livres-compétences », repérez la zone « Importer un livre » en haut (avec le badge « Nouveau » et l\'icône ✨).',
          'Cliquez sur « Choisir un PDF ou EPUB » ou glissez-déposez directement votre fichier (PDF ou EPUB, max. 50 Mo).',
          'ThesisFrame extrait le texte du document, puis l\'IA analyse la structure pour identifier les cadres, principes, techniques et pièges. Cette étape prend 30 à 90 secondes.',
          'Une barre de progression indique l\'avancement. Quand l\'analyse est terminée, le livre apparaît dans l\'onglet « Importés » avec un badge violet.',
          'Activez-le comme un livre intégré : il injecte ses connaissances dans le Directeur IA. Vous pouvez le supprimer à tout moment.',
        ],
        tip: 'L\'import est inspiré du projet « book-to-skill » — le même principe d\'extraction de structure (pas de résumé) est appliqué pour transformer votre livre en compétence exploitable par l\'IA.',
      },
      {
        title: 'Planifier avec la Route Agile',
        steps: [
          'Dans les « Outils », cliquez sur « Route Agile ». Cet outil de planification adapté à la thèse vous aide à organiser votre travail en sprints.',
          'Créez un sprint en cliquant sur « + Nouveau sprint ». Donnez-lui un nom (ex. : « Rédaction chapitre 2 ») et une durée (ex. : 2 semaines).',
          'Ajoutez des tâches au sprint : « Résumer 15 articles sur X », « Rédiger la section 2.1 », « Relire et corriger la section 2.2 », etc.',
          'Définissez la priorité de chaque tâche et estimez le temps nécessaire. L\'outil affiche une vue d\'ensemble de la charge de travail du sprint.',
          'Suivez votre progression : cochez les tâches terminées, consultez le burndown chart et identifiez les retards potentiels.',
        ],
        tip: 'La méthode agile adaptée à la thèse consiste à travailler en cycles courts (sprints de 1 à 3 semaines). Cela rend le projet de thèse moins intimidant et permet de mesurer régulièrement vos progrès.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 12. GESTION DES LICENCES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gestion-licences',
    title: 'Gestion des licences',
    icon: 'KeyRound',
    description:
      'Activez votre licence ThesisFrame pour débloquer toutes les fonctionnalités avancées, ou gérez les clés en mode administrateur.',
    color: 'slate',
    examples: [
      {
        title: 'Activer une licence',
        steps: [
          'Ouvrez le panneau « Licences » accessible depuis la barre latérale ou les paramètres (icône clé 🔑).',
          'Dans le champ « Clé de licence », collez votre clé de licence que vous avez reçue par e-mail ou sur la plateforme ThesisFrame.',
          'Vérifiez que la clé est correcte (elle se compose de caractères alphanumériques en groupes séparés par des tirets).',
          'Cliquez sur « Activer ». ThesisFrame vérifie la clé auprès du serveur de licence et active votre compte.',
          'Un message de confirmation s\'affiche avec le type de licence (Essai, Standard, Premium) et sa date d\'expiration. Toutes les fonctionnalités sont débloquées.',
        ],
        tip: 'Si votre licence n\'est pas reconnue, vérifiez que vous avez bien copié la clé en entier (sans espaces supplémentaires). Contactez le support si le problème persiste.',
      },
      {
        title: 'Générer des clés de licence (admin)',
        steps: [
          'Dans le panneau « Licences », cliquez sur l\'onglet « Administration » (visible uniquement pour les comptes administrateur).',
          'Pour générer une nouvelle clé, cliquez sur « Générer une clé ». Choisissez le type de licence : « Essai » (7 jours), « Standard » (1 an) ou « Premium » (illimité).',
          'Si vous générez une clé pour un utilisateur spécifique, saisissez son adresse e-mail pour lier la clé à son compte.',
          'La clé générée s\'affiche à l\'écran. Copiez-la et transmettez-la à l\'utilisateur concerné.',
          'Dans le tableau de gestion, consultez la liste de toutes les clés : statut (active/expirée/révoquée), utilisateur associé, date d\'activation et date d\'expiration. Révoquez une clé si nécessaire.',
        ],
        tip: 'Les clés d\'essai sont gratuites et limitées à 7 jours — idéales pour laisser un doctorant tester ThesisFrame avant de décider d\'acheter une licence complète.',
      },
    ],
  },
]
