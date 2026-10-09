# Décision — « Unlimited-OCR » (Baidu) comme moteur OCR — veille active, non-intégration aujourd'hui

> IM propriétaire (2026-10-08) : « voir le lien pour cet outil d'OCR très performant : https://github.com/baidu/Unlimited-OCR ».
> Décision adossée aux FAITS vérifiés en direct le 2026-10-08. Zéro code. Réversible (déclencheurs § 4).

## 1. Ce qu'est l'outil (faits vérifiés)

- **Unlimited OCR Works** (Baidu, publié 2026-06-22) : modèle d'OCR end-to-end de type VLM, présenté comme la suite de DeepSeek-OCR — décodeur à attention glissante R-SWA (KV cache constant) permettant de transcrire des dizaines de pages **en un seul passage** sous 32K tokens (arXiv 2606.23050).
- **Licence MIT** (GitHub API) — libre, utilisable commercialement. 26 798 étoiles, 1 291 147 téléchargements HF — projet très actif et crédible.
- **Poids : 6,67 Go (bf16)** — soit ~3,3 milliards de paramètres (HF, model.safetensors unique).
- Entrée : images (mode gundam/base) ou PDF → pages PNG 300 dpi (PyMuPDF) ; sortie : texte/Markdown structuré via prompt (`<image>document parsing.`).
- Déploiements officiels : **Transformers sur GPU NVIDIA (torch 2.10 + CUDA 12.9/13.0)**, vLLM (images Docker dédiées), SGLang (wheels spécifiques) — **aucune variante CPU/ONNX** publiée à ce jour. Démo HF Spaces + offre cloud Baidu (API payante).

## 2. Pourquoi c'est pertinent pour ThesisFrame (reconnaissance honnête)

- Notre point douloureux mesuré : confiances Tesseract faibles sur scans anciens/médiocres — Landscape as Urbanism **26 %**, Post-pandemic **32 %**, Cullen **34 %**, Cities of Tomorrow 43 % ; seule référence correcte : Dupuy 82 %.
- Un VLM-OCR de cette classe améliore très vraisemblablement nettement ces chiffres (contexte langagier + structure). L'intérêt est réel — c'est précisément la limite actuelle de l'app.

## 3. Pourquoi NON aujourd'hui (faits bloquants, machine vérifiée)

1. **GPU NVIDIA obligatoire** : tous les chemins officiels (transformers/vLLM/SGLang) exigent CUDA 12.9/13.0. Machine de travail vérifiée ce jour : **aucun GPU NVIDIA** (nvidia-smi absent) et **3 Go de RAM totale** — les poids seuls (6,67 Go) ne tiennent pas en mémoire. Aucune exécution possible ici, donc aucun banc comparatif honnête ne peut être produit.
2. **Architecture desktop offline** : ThesisFrame est une app Tauri offline-first dont l'OCR tourne dans un sidecar node avec données de langue locales (vendor/tessdata, quelques Mo). Embarquer un runtime Python CUDA + 6,67 Go de poids dans ce schéma n'est pas réaliste (la dette de packaging tessdata est déjà consignée).
3. **Confidentialité — décision propriétaire consignée** : « les documents ne quittent pas la machine » (cycle import-corpus-ressources, 5b75ee8). La voie alternative cloud (API Baidu / HF Spaces) enverrait les pages de la thèse à un service tiers — **inacceptable en l'état** ; elle ne pourrait être envisagée que sur validation explicite du propriétaire.

## 4. Décision et déclencheurs de réévaluation (réversibilité)

**Décision : veille active, non-intégration aujourd'hui.** Tesseract reste le moteur ; le correctif ocr-rss-purge et la langue fra restent inchangés.

Réévaluer si l'un de ces déclencheurs survient :
- **T-a (moteur premium local)** : le poste de l'utilisateur dispose d'un GPU NVIDIA ≥ 8-10 Go de VRAM → déploiement local optionnel (serveur OpenAI-compatible SGLang/vLLM à côté de l'app), branché comme moteur OCR « premium » avec repli Tesseract — les documents restent en local ; banc comparatif sur Cullen/Landscape comme référence chiffrée.
- **T-b (variante légère)** : publication d'une variante CPU/ONNX/quantifiée exécutable en sidecar (à suivre sur le dépôt).
- **T-c (validation cloud)** : le propriétaire accepte explicitement l'envoi de pages vers un service tiers (à proscrire pour le contenu de thèse non publié).
- **T-d (dette packaging)** : si le packaging desktop démarre, statuer d'abord sur tessdata ; un éventuel second moteur ne sera décidé qu'après.

## 5. Preuves

- README brut lu : `https://raw.githubusercontent.com/baidu/Unlimited-OCR/main/README.md` (requirements CUDA 12.9, torch 2.10.0, transformers 4.57.1 ; vLLM Docker `vllm-openai:unlimited-ocr` ; SGLang ; PDF→PNG 300 dpi).
- GitHub API : license MIT, 26 798 stars, créé 2026-06-18.
- HuggingFace API : 1 291 147 téléchargements, tags `license:mit`, poids 6,67 Go (bf16).
- arXiv 2606.23050 : abstract R-SWA / KV cache constant / « dozens of pages in a single forward pass ».
- Machine locale : nvidia-smi absent ; `free -g` → 3 Go total.
