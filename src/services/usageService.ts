// src/services/usageService.ts

import { db } from '@/lib/firebase/config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  UserUsageDocument,
  AggregatedUsage,
  UsageByModel,
  UsageByDate,
  UsageEntry,
  AppUser,
} from '@/types/usage';

/**
 * Fetch all user usage documents from Firestore
 */
export async function getAllUserUsage(): Promise<UserUsageDocument[]> {
  try {
    const usageRef = collection(db, 'usage');
    const q = query(usageRef, orderBy('lastUpdated', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: data.userId,
        totalCalls: data.totalCalls || 0,
        totalInputTokens: data.totalInputTokens || 0,
        totalOutputTokens: data.totalOutputTokens || 0,
        totalTokens: data.totalTokens || 0,
        totalCostUsd: data.totalCostUsd || 0,
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        recentUsage: (data.recentUsage || []).map((entry: any) => ({
          timestamp: entry.timestamp?.toDate() || new Date(),
          model: entry.model,
          inputTokens: entry.inputTokens || 0,
          outputTokens: entry.outputTokens || 0,
          totalTokens: entry.totalTokens || 0,
          costUsd: entry.costUsd || 0,
          calls: entry.calls || 1,
        })),
      };
    });
  } catch (error) {
    console.error('Error fetching user usage:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<AppUser[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: doc.id, // The doc ID is the userId
        email: data.email,
        isApproved: data.isApproved,
        username: data.username,
        // --- THIS IS THE FIX ---
        // Parse the string directly, as it is not a Timestamp
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

/**
 * Approve a user by setting isApproved to true
 */
export async function approveUser(userId: string): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    isApproved: true,
  });
}

/**
 * Calculate aggregated usage across all users
 */
export function calculateAggregatedUsage(
  userUsageList: UserUsageDocument[]
): AggregatedUsage {
  const aggregated: AggregatedUsage = {
    totalCalls: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    userCount: userUsageList.length,
    averageCostPerUser: 0,
    averageCostPerCall: 0,
  };

  userUsageList.forEach((user) => {
    aggregated.totalCalls += user.totalCalls;
    aggregated.totalInputTokens += user.totalInputTokens;
    aggregated.totalOutputTokens += user.totalOutputTokens;
    aggregated.totalTokens += user.totalTokens;
    aggregated.totalCostUsd += user.totalCostUsd;
  });

  aggregated.averageCostPerUser =
    aggregated.userCount > 0
      ? aggregated.totalCostUsd / aggregated.userCount
      : 0;

  aggregated.averageCostPerCall =
    aggregated.totalCalls > 0
      ? aggregated.totalCostUsd / aggregated.totalCalls
      : 0;

  return aggregated;
}

/**
 * Calculate usage by model
 */
export function calculateUsageByModel(
  userUsageList: UserUsageDocument[]
): UsageByModel[] {
  const modelMap = new Map<string, UsageByModel>();

  userUsageList.forEach((user) => {
    user.recentUsage.forEach((entry) => {
      const existing = modelMap.get(entry.model) || {
        model: entry.model,
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        costUsd: 0,
      };

      existing.calls += entry.calls;
      existing.inputTokens += entry.inputTokens;
      existing.outputTokens += entry.outputTokens;
      existing.totalTokens += entry.totalTokens;
      existing.costUsd += entry.costUsd;

      modelMap.set(entry.model, existing);
    });
  });

  return Array.from(modelMap.values()).sort(
    (a, b) => b.costUsd - a.costUsd
  );
}

/**
 * Calculate usage by date (last 30 days)
 */
export function calculateUsageByDate(
  userUsageList: UserUsageDocument[]
): UsageByDate[] {
  const dateMap = new Map<string, UsageByDate>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  userUsageList.forEach((user) => {
    user.recentUsage.forEach((entry) => {
      if (entry.timestamp >= thirtyDaysAgo) {
        const dateStr = entry.timestamp.toISOString().split('T')[0];
        const existing = dateMap.get(dateStr) || {
          date: dateStr,
          calls: 0,
          costUsd: 0,
          tokens: 0,
        };

        existing.calls += entry.calls;
        existing.costUsd += entry.costUsd;
        existing.tokens += entry.totalTokens;

        dateMap.set(dateStr, existing);
      }
    });
  });

  return Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top users by cost
 */
export function getTopUsersByCost(
  userUsageList: UserUsageDocument[],
  limit_count: number = 10
): UserUsageDocument[] {
  return userUsageList
    .sort((a, b) => b.totalCostUsd - a.totalCostUsd)
    .slice(0, limit_count);
}

