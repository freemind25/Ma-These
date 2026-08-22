import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const BOOKS = [
  {
    title: '100 Questions (and Answers) About Research Methods',
    author: 'Neil J. Salkind',
    file: 'salkind-100-questions.txt',
    tags: 'méthodologie, recherche, questions-réponses, méthodes quantitatives, méthodes qualitatives',
  },
  {
    title: 'Applied Data Analysis for Urban Planning and Management',
    author: 'Alasdair Rae, Cecilia Wong',
    file: 'rae-wong-applied-data.txt',
    tags: 'analyse de données, urbanisme, SIG, planification, statistiques spatiales',
  },
  {
    title: 'How to Write a Literature Review: A Workbook in Six Steps',
    author: 'Jim Ollhoff',
    file: 'ollhoff-literature-review.txt',
    tags: 'revue de littérature, rédaction, recherche bibliographique, synthèse',
  },
  {
    title: 'Mapping Your Thesis: Theory and Techniques for Doctoral Research',
    author: 'Barry White',
    file: 'white-mapping-thesis.txt',
    tags: 'thèse, plan de thèse, techniques de recherche, rédaction doctorale, méthodologie',
  },
  {
    title: 'Research Methodology: A Step-by-Step Guide for Beginners',
    author: 'Ranjit Kumar',
    file: 'kumar-research-methodology.txt',
    tags: 'méthodologie, recherche, guide débutant, enquête, échantillonnage, analyse',
  },
];

async function main() {
  const baseDir = resolve(process.cwd(), 'upload/extracted-text');

  for (const book of BOOKS) {
    const filePath = resolve(baseDir, book.file);
    console.log(`Seeding: ${book.title}...`);

    try {
      const content = readFileSync(filePath, 'utf-8');

      const skill = await db.customBookSkill.create({
        data: {
          title: book.title,
          author: book.author,
          content,
          tags: book.tags,
        },
      });

      console.log(`  ✓ ${skill.title} — ${content.length.toLocaleString()} chars (id: ${skill.id.slice(0, 8)})`);
    } catch (err) {
      console.error(`  ✗ Failed: ${book.file}`, err);
    }
  }

  const total = await db.customBookSkill.count();
  console.log(`\nTotal book-skills in DB: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
