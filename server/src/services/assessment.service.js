import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';
import { localYmd } from '../utils/dates.js';
import { ASSESSMENTS, SCALE, bandFor, maxScoreFor } from '../content/assessments.js';
import { awardXp, REWARDS, touchStreak } from './gamification.service.js';
import { getUserTimezone } from './user.service.js';

const contentFor = (slug) => ASSESSMENTS.find((a) => a.slug === slug);

async function loadAssessment(id) {
  const row = await prisma.assessment.findFirst({
    where: { id, isActive: true },
    include: { questions: { orderBy: { position: 'asc' } } },
  });
  if (!row) throw new AppError(404, 'NOT_FOUND', 'That assessment could not be found');
  const content = contentFor(row.slug);
  if (!content) throw new AppError(404, 'NOT_FOUND', 'That assessment could not be found');
  return { row, content };
}

export async function listAssessments() {
  const rows = await prisma.assessment.findMany({
    where: { isActive: true },
    orderBy: { slug: 'asc' },
    include: { _count: { select: { questions: true } } },
  });
  return rows.map((r) => {
    const c = contentFor(r.slug);
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      disclaimer: c?.disclaimer ?? '',
      questionCount: r._count.questions,
      scale: SCALE,
    };
  });
}

export async function getAssessment(id) {
  const { row, content } = await loadAssessment(id);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    disclaimer: content.disclaimer,
    scale: SCALE,
    questions: row.questions.map((q) => ({ id: q.id, position: q.position, prompt: q.prompt })),
    maxScore: maxScoreFor(content),
  };
}

export async function submitAssessment(userId, id, answers) {
  const { row, content } = await loadAssessment(id);

  // Every question must be answered exactly once with a valid option value.
  const validIds = new Set(row.questions.map((q) => q.id));
  const seen = new Map();
  for (const a of answers) {
    if (!validIds.has(a.questionId)) {
      throw new AppError(422, 'VALIDATION_ERROR', 'One of the answers does not match this assessment');
    }
    if (seen.has(a.questionId)) {
      throw new AppError(422, 'VALIDATION_ERROR', 'Each question can only be answered once');
    }
    seen.set(a.questionId, a.value);
  }
  if (seen.size !== row.questions.length) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Please answer every question before seeing your result');
  }

  const total = [...seen.values()].reduce((sum, v) => sum + v, 0);
  const band = bandFor(content, total);
  const today = localYmd(await getUserTimezone(userId));

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.assessmentResult.create({
      data: {
        userId,
        assessmentId: row.id,
        totalScore: total,
        category: band.category,
        summary: band.summary,
        answers: { create: [...seen.entries()].map(([questionId, value]) => ({ questionId, value })) },
      },
    });
    const reward = await awardXp(tx, userId, 'ASSESSMENT_COMPLETED', REWARDS.ASSESSMENT_COMPLETED, `assessment:${row.id}:${today}`);
    await touchStreak(tx, userId, today);
    return { created, reward };
  });

  return {
    result: {
      id: result.created.id,
      assessmentSlug: row.slug,
      title: row.title,
      totalScore: total,
      maxScore: maxScoreFor(content),
      category: band.category,
      summary: band.summary,
      recommendations: band.recommendations,
      suggestion: band.suggestion,
      disclaimer: content.disclaimer,
      completedAt: result.created.createdAt.toISOString(),
    },
    reward: { awarded: result.reward.awarded, amount: result.reward.amount, leveledUp: result.reward.leveledUp },
  };
}

export async function assessmentHistory(userId) {
  const rows = await prisma.assessmentResult.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { assessment: { select: { slug: true, title: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    assessmentSlug: r.assessment.slug,
    title: r.assessment.title,
    totalScore: r.totalScore,
    category: r.category,
    summary: r.summary,
    completedAt: r.createdAt.toISOString(),
  }));
}
