// Seeds reference content only. Idempotent: safe to run more than once.
// Content lives in src/content so the server and the database never drift apart.
import { PrismaClient } from '@prisma/client';
import { ASSESSMENTS } from '../src/content/assessments.js';
import { ACTIVITIES, RESOURCES } from '../src/content/wellness.js';

const prisma = new PrismaClient();

const affirmations = [
  'I am allowed to grow at my own pace.',
  'My feelings are valid, even the hard ones.',
  'I can rest without earning it.',
  'I am doing the best I can with what I have today.',
  'Small steps still move me forward.',
  'I deserve the same kindness I give to others.',
  'It is okay to ask for help.',
  'I can set boundaries and still be loved.',
  'Today I choose gentleness over pressure.',
  'I am more than my worst day.',
];

const sampleTherapists = [
  {
    name: 'SAMPLE — Listing 1 (not a real provider)',
    specialization: 'Anxiety and stress',
    city: 'Sample City',
    region: 'Sample Region',
    languages: ['English'],
    consultation: 'Video or in person — sample data',
    isVerified: false,
    isSample: true,
  },
];

async function seedAssessments() {
  for (const def of ASSESSMENTS) {
    const row = await prisma.assessment.upsert({
      where: { slug: def.slug },
      update: { title: def.title, description: def.description },
      create: { slug: def.slug, kind: def.kind, title: def.title, description: def.description },
    });
    // Upsert by position so existing answers keep pointing at the same question rows.
    for (const [i, prompt] of def.questions.entries()) {
      const options = [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'A little' },
        { value: 2, label: 'Quite a bit' },
        { value: 3, label: 'Almost always' },
      ];
      await prisma.assessmentQuestion.upsert({
        where: { assessmentId_position: { assessmentId: row.id, position: i + 1 } },
        update: { prompt, options },
        create: { assessmentId: row.id, position: i + 1, prompt, options },
      });
    }
  }
}

async function main() {
  for (const text of affirmations) {
    await prisma.affirmation.upsert({ where: { text }, update: {}, create: { text } });
  }

  for (const a of ACTIVITIES) {
    await prisma.wellnessActivity.upsert({
      where: { slug: a.slug },
      update: { title: a.title, description: a.description, category: a.category, durationSec: a.durationSec, xpReward: a.xpReward, steps: a.steps },
      create: { slug: a.slug, title: a.title, description: a.description, category: a.category, durationSec: a.durationSec, xpReward: a.xpReward, steps: a.steps },
    });
  }

  for (const r of RESOURCES) {
    await prisma.wellnessResource.upsert({
      where: { slug: r.slug },
      update: { title: r.title, summary: r.summary, sections: r.sections },
      create: { slug: r.slug, title: r.title, summary: r.summary, sections: r.sections },
    });
  }

  await seedAssessments();

  // Sample therapist rows are inserted only into an empty table, so they never overwrite a verified directory.
  if ((await prisma.therapistProfile.count()) === 0) {
    await prisma.therapistProfile.createMany({ data: sampleTherapists });
  }

  console.log(
    `Seeded ${affirmations.length} affirmations, ${ACTIVITIES.length} activities, ${RESOURCES.length} resources, ${ASSESSMENTS.length} assessments.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
