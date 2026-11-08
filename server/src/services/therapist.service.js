import { prisma } from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

const publicFields = {
  id: true,
  name: true,
  specialization: true,
  city: true,
  region: true,
  languages: true,
  isVerified: true,
  isSample: true,
  consultation: true,
  contactUrl: true,
};

// Searches the directory. Location is matched by city text only; the server never
// receives or stores the user's device coordinates.
export async function searchTherapists({ q, city, verifiedOnly, limit, offset }) {
  const and = [];
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { specialization: { contains: q, mode: 'insensitive' } },
      ],
    });
  }
  if (city) and.push({ city: { contains: city, mode: 'insensitive' } });
  if (verifiedOnly) and.push({ isVerified: true });

  const where = and.length ? { AND: and } : {};
  const [items, total] = await Promise.all([
    prisma.therapistProfile.findMany({ where, select: publicFields, orderBy: { name: 'asc' }, take: limit, skip: offset }),
    prisma.therapistProfile.count({ where }),
  ]);
  return { items, total, limit, offset };
}

export async function getTherapist(id) {
  const row = await prisma.therapistProfile.findUnique({ where: { id }, select: publicFields });
  if (!row) throw new AppError(404, 'NOT_FOUND', 'That listing could not be found');
  return row;
}
