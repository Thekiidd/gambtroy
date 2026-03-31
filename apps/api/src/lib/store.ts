import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';

export type Role = 'USER' | 'GUARDIAN' | 'ADMIN';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface BlockedSiteRecord {
  id: string;
  userId: string;
  domain: string;
  name: string;
  category: 'CASINO' | 'SPORTS_BETTING' | 'POKER' | 'LOTTERY' | 'SLOTS' | 'OTHER';
  isActive: boolean;
  requiresGuardianToUnblock: boolean;
  createdAt: string;
}

export interface LossRecord {
  id: string;
  userId: string;
  amount: number;
  currency: 'MXN' | 'USD';
  platform?: string;
  description?: string;
  date: string;
}

export interface GuardianInvite {
  id: string;
  userId: string;
  guardianEmail: string;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED';
  createdAt: string;
}

const users = new Map<string, UserRecord>();
const usersByEmail = new Map<string, string>();
const blocklist = new Map<string, BlockedSiteRecord>();
const losses = new Map<string, LossRecord>();
const guardianInvites = new Map<string, GuardianInvite>();

function hashPassword(password: string): string {
  const salt = 'gambtroy-demo-salt';
  return scryptSync(password, salt, 32).toString('hex');
}

export function registerUser(email: string, name: string, password: string): UserRecord {
  if (usersByEmail.has(email)) {
    throw new Error('EMAIL_TAKEN');
  }

  const user: UserRecord = {
    id: randomUUID(),
    email,
    name,
    passwordHash: hashPassword(password),
    role: 'USER',
    createdAt: new Date().toISOString()
  };

  users.set(user.id, user);
  usersByEmail.set(email, user.id);
  return user;
}

export function loginUser(email: string, password: string): UserRecord | null {
  const userId = usersByEmail.get(email);
  if (!userId) return null;

  const user = users.get(userId);
  if (!user) return null;

  const incoming = Buffer.from(hashPassword(password), 'hex');
  const stored = Buffer.from(user.passwordHash, 'hex');
  if (!timingSafeEqual(incoming, stored)) return null;

  return user;
}

export function findUserById(id: string): UserRecord | null {
  return users.get(id) ?? null;
}

export function updateUserName(id: string, name: string): UserRecord | null {
  const user = users.get(id);
  if (!user) return null;
  const updated = { ...user, name };
  users.set(id, updated);
  return updated;
}

export function addBlockedSite(site: Omit<BlockedSiteRecord, 'id' | 'createdAt'>): BlockedSiteRecord {
  const created: BlockedSiteRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...site
  };
  blocklist.set(created.id, created);
  return created;
}

export function getBlockedSites(userId: string): BlockedSiteRecord[] {
  return [...blocklist.values()].filter((site) => site.userId === userId);
}

export function toggleBlockedSite(id: string, userId: string): BlockedSiteRecord | null {
  const existing = blocklist.get(id);
  if (!existing || existing.userId !== userId) return null;
  const updated = { ...existing, isActive: !existing.isActive };
  blocklist.set(id, updated);
  return updated;
}

export function removeBlockedSite(id: string, userId: string): boolean {
  const existing = blocklist.get(id);
  if (!existing || existing.userId !== userId) return false;
  return blocklist.delete(id);
}

export function addLoss(loss: Omit<LossRecord, 'id'>): LossRecord {
  const created: LossRecord = { id: randomUUID(), ...loss };
  losses.set(created.id, created);
  return created;
}

export function getLosses(userId: string): LossRecord[] {
  return [...losses.values()].filter((loss) => loss.userId === userId);
}

export function inviteGuardian(userId: string, guardianEmail: string): GuardianInvite {
  const invite: GuardianInvite = {
    id: randomUUID(),
    userId,
    guardianEmail,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  guardianInvites.set(invite.id, invite);
  return invite;
}

export function listGuardianInvites(userId: string): GuardianInvite[] {
  return [...guardianInvites.values()].filter((invite) => invite.userId === userId);
}

export function acceptGuardianInvite(inviteId: string, userId: string): GuardianInvite | null {
  const invite = guardianInvites.get(inviteId);
  if (!invite || invite.userId !== userId) return null;
  const updated: GuardianInvite = { ...invite, status: 'ACTIVE' };
  guardianInvites.set(inviteId, updated);
  return updated;
}
