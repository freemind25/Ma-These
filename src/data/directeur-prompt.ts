// ═══════════════════════════════════════
// ThesisFrame — Directeur de Thèse AI Prompt
// ═══════════════════════════════════════
//
// Ce module construit le prompt système du directeur de thèse IA
// en injectant les connaissances du corpus de supervision doctorale.
//

import {
  SUPERVISION_CORPUS,
  PRINCIPES_SUPERVISION,
  CRITERES_QUALITE,
  ETAPES_SUPERVISION,
  PROBLEMES_FREQUENTS,
  QUESTIONS_FACILITATRICES,
  NORMES_REDACTION,
} from "./corpus-supervision";

// --- Prompt de base (existant, préservé tel quel) ---

export const DIRECTEUR_SYSTEM_PROMPT = `Tu es le Professeur Jean-Marc Renaud, un directeur de thèse expérimenté et bienveillant spécialisé en recherche académique francophone. Tu accompagnes un(e) doctorant(e) dans la rédaction de sa thèse.

TON PERSONNALITÉ :
- Académique rigoureux mais encourageant
- Honnête et constructif dans tes retours
- Patient et pédagogue
- Tu poses des questions stimulantes pour faire réfléchir
- Tu proposes des pistes sans imposer tes choix

TON RÔLE :
1. Feedback sur les chapitres rédigés
2. Conseils méthodologiques
3. Suggestions de lectures complémentaires
4. Aide à la structuration de l'argumentation
5. Reminders sur les deadlines et étapes
6. Encouragement et motivation

MÉTHODE DE FEEDBACK :
Quand le doctorant te partage du texte ou décrit son travail :
1. Commence par valoriser les points forts
2. Identifie 2-3 points d'amélioration prioritaires
3. Pose des questions ouvertes pour stimuler la réflexion
4. Propose des références ou pistes concrètes
5. Termine par un encouragement

CONTRAINTES :
- Réponds toujours en français académique soigné
- Reste dans le rôle du directeur de thèse
- Ne révèle pas que tu es une IA
- Limite tes réponses à 400 mots sauf demande spécifique
- Structure avec des paragraphes aérés`;

// --- Section injectée : connaissances en supervision (synthèse du corpus) ---

function buildCorpusSection(): string {
  const principesText = PRINCIPES_SUPERVISION.map((p, i) => `  ${i + 1}. ${p.replace(/^Principe : /, "")}`).join("\n");

  const etapesText = ETAPES_SUPERVISION.map(
    (e) =>
      `  ► ${e.nom} : ${e.description}\n` +
      `    Jalons clés : ${e.jalons.join(" ; ")}\n` +
      `    Questions de diagnostic : ${e.questionsDiagnostic.slice(0, 2).join(" | ")}`
  ).join("\n\n");

  const criteresText = Object.entries(CRITERES_QUALITE)
    .map(([cle, items]) => `  ${cle.toUpperCase()} :\n    ${items.map((c) => `• ${c.replace(/^Critère : /, "")}`).join("\n    ")}`)
    .join("\n\n");

  const problemesText = PROBLEMES_FREQUENTS.map(
    (p) =>
      `  ⚠ ${p.probleme}\n` +
      `    Signaux : ${p.signaux.slice(0, 2).join(" ; ")}\n` +
      `    Intervention : ${p.interventions.slice(0, 2).join(" ; ")}`
  ).join("\n\n");

  const questionsText = Object.entries(QUESTIONS_FACILITATRICES)
    .map(([cle, items]) => `  ${cle.toUpperCase()} :\n    ${items.map((q) => `• ${q}`).join("\n    ")}`)
    .join("\n\n");

  const normesText = Object.entries(NORMES_REDACTION)
    .map(([cle, items]) => `  ${cle.toUpperCase()} :\n    ${items.map((r) => `• ${r.replace(/^Règle : /, "")}`).join("\n    ")}`)
    .join("\n\n");

  return `
╔══════════════════════════════════════════════════════╗
║  CONNAISSANCES EN SUPERVISION DOCTORALE (Corpus IA)   ║
║  Synthèse de la littérature internationale           ║
╚══════════════════════════════════════════════════════╝

📌 PRINCIPES FONDAMENTAUX :
${principesText}

📋 ÉTAPES DE LA SUPERVISION :
${etapesText}

✅ CRITÈRES DE QUALITÉ :
${criteresText}

⚠ PROBLÈMES FRÉQUENTS ET INTERVENTIONS :
${problemesText}

❓ QUESTIONS FACILITATRICES (à utiliser selon le contexte) :
${questionsText}

📝 NORMES DE RÉDACTION ACADÉMIQUE :
${normesText}

`;
}

// --- Construction du prompt complet avec corpus ---

/**
 * Construit le prompt système du directeur de thèse IA
 * en injectant le corpus de connaissances en supervision.
 *
 * @param options - Options de personnalisation
 * @param options.phaseActuelle - Phase actuelle du doctorat (optionnel)
 * @param options.specialisation - Spécialisation disciplinaire (optionnel)
 * @returns Le prompt système complet
 */
export function buildDirecteurPrompt(options?: {
  phaseActuelle?: string;
  specialisation?: string;
}): string {
  const contexteSupplementaire: string[] = [];

  if (options?.phaseActuelle) {
    const phase = options.phaseActuelle;
    const etape = ETAPES_SUPERVISION.find(
      (e) => e.nom.toLowerCase().includes(phase.toLowerCase())
    );
    if (etape) {
      contexteSupplementaire.push(
        `Le doctorant se trouve actuellement dans la phase : ${etape.nom}.`,
        `Concentre-toi sur les jalons pertinents : ${etape.jalons.join(", ")}.`,
        `Surveille les pièges suivants : ${etape.pieges.join(" ; ")}.`
      );
    } else {
      contexteSupplementaire.push(`Le doctorant a indiqué être en phase : ${options.phaseActuelle}.`);
    }
  }

  if (options?.specialisation) {
    contexteSupplementaire.push(
      `Domaine de spécialisation du doctorant : ${options.specialisation}.`,
      `Adapte tes conseils et suggestions de lecture à ce champ disciplinaire.`
    );
  }

  const contexteSection =
    contexteSupplementaire.length > 0
      ? `\n\n📌 CONTEXTE ACTUEL DU DOCTORANT :\n${contexteSupplementaire.map((c) => `  - ${c}`).join("\n")}\n`
      : "";

  const corpusSection = buildCorpusSection();

  const instructionCorpus = `
🎯 INSTRUCTION D'UTILISATION DU CORPUS :
Utilise les connaissances en supervision ci-dessus pour :
- Adapter tes retours au stade d'avancement du doctorant
- Identifier les signaux d'alerte et proposer des interventions appropriées
- Poser des questions diagnostiques et facilitatrices pertinentes
- Appliquer les critères de qualité correspondant à la tâche en cours
- Respecter les normes de rédaction académique dans tes conseils
- Garder à l'esprit les principes fondamentaux de supervision dans chaque interaction
`;

  return (
    DIRECTEUR_SYSTEM_PROMPT +
    "\n" +
    corpusSection +
    contexteSection +
    instructionCorpus
  );
}

// --- Export du corpus pour réutilisation ailleurs ---

export { SUPERVISION_CORPUS };
