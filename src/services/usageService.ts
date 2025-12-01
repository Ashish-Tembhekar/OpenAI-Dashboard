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
        // TTS fields
        ttsUsageCalls: data.ttsUsageCalls || 0,
        ttsTotalTokens: data.ttsTotalTokens || 0,
        ttsTotalCpuMemoryMb: data.ttsTotalCpuMemoryMb || 0,
        ttsTotalGpuMemoryMb: data.ttsTotalGpuMemoryMb || 0,
        ttsTotalElapsedSeconds: data.ttsTotalElapsedSeconds || 0,
        recentTtsUsage: (data.recentTtsUsage || []).map((entry: any) => ({
          timestamp: entry.timestamp?.toDate() || new Date(),
          device: entry.device || 'unknown',
          cpuMemoryUsedMb: entry.cpuMemoryUsedMb || 0,
          gpuMemoryUsedMb: entry.gpuMemoryUsedMb || 0,
          elapsedTimeSeconds: entry.elapsedTimeSeconds || 0,
          estimatedTokens: entry.estimatedTokens || 0,
          textLength: entry.textLength || 0,
          numChunks: entry.numChunks || 0,
          tokensPerSecond: entry.tokensPerSecond || 0,
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

/**
 * Calculate TTS usage by date (last 30 days)
 */
export function calculateTtsUsageByDate(
  userUsageList: UserUsageDocument[]
): Array<{
  date: string;
  calls: number;
  tokens: number;
  cpuMemoryMb: number;
  gpuMemoryMb: number;
  elapsedSeconds: number;
}> {
  const dateMap = new Map<string, {
    date: string;
    calls: number;
    tokens: number;
    cpuMemoryMb: number;
    gpuMemoryMb: number;
    elapsedSeconds: number;
  }>();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  userUsageList.forEach((user) => {
    if (user.recentTtsUsage) {
      user.recentTtsUsage.forEach((entry) => {
        if (entry.timestamp >= thirtyDaysAgo) {
          const dateStr = entry.timestamp.toISOString().split('T')[0];
          const existing = dateMap.get(dateStr) || {
            date: dateStr,
            calls: 0,
            tokens: 0,
            cpuMemoryMb: 0,
            gpuMemoryMb: 0,
            elapsedSeconds: 0,
          };

          existing.calls += 1;
          existing.tokens += entry.estimatedTokens;
          existing.cpuMemoryMb += entry.cpuMemoryUsedMb;
          existing.gpuMemoryMb += entry.gpuMemoryUsedMb;
          existing.elapsedSeconds += entry.elapsedTimeSeconds;

          dateMap.set(dateStr, existing);
        }
      });
    }
  });

  return Array.from(dateMap.values())
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate aggregated TTS usage statistics
 */
export function calculateAggregatedTtsUsage(
  userUsageList: UserUsageDocument[]
): {
  totalCalls: number;
  totalTokens: number;
  totalCpuMemoryMb: number;
  totalGpuMemoryMb: number;
  totalElapsedSeconds: number;
  userCount: number;
  averageTokensPerCall: number;
  averageTimePerCall: number;
} {
  const aggregated = {
    totalCalls: 0,
    totalTokens: 0,
    totalCpuMemoryMb: 0,
    totalGpuMemoryMb: 0,
    totalElapsedSeconds: 0,
    userCount: 0,
    averageTokensPerCall: 0,
    averageTimePerCall: 0,
  };

  userUsageList.forEach((user) => {
    if (user.ttsUsageCalls && user.ttsUsageCalls > 0) {
      aggregated.totalCalls += user.ttsUsageCalls;
      aggregated.totalTokens += user.ttsTotalTokens || 0;
      aggregated.totalCpuMemoryMb += user.ttsTotalCpuMemoryMb || 0;
      aggregated.totalGpuMemoryMb += user.ttsTotalGpuMemoryMb || 0;
      aggregated.totalElapsedSeconds += user.ttsTotalElapsedSeconds || 0;
      aggregated.userCount += 1;
    }
  });

  aggregated.averageTokensPerCall =
    aggregated.totalCalls > 0
      ? aggregated.totalTokens / aggregated.totalCalls
      : 0;

  aggregated.averageTimePerCall =
    aggregated.totalCalls > 0
      ? aggregated.totalElapsedSeconds / aggregated.totalCalls
      : 0;

  return aggregated;
}

