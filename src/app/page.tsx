'use client';

import { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { OverviewCards } from '@/components/OverviewCards';
import { UsageCharts } from '@/components/UsageCharts';
import { UserUsageTable } from '@/components/UserUsageTable';
import {
  getAllUserUsage,
  calculateAggregatedUsage,
  getAllUsers, // New
  approveUser, // New
} from '@/services/usageService';
import {
  UserUsageDocument,
  AggregatedUsage,
  AppUser, // New
} from '@/types/usage';
import { auth, googleProvider } from '@/lib/firebase/config';
import {
  onAuthStateChanged,
  signInWithPopup,
  User,
  signOut, // New
} from 'firebase/auth';

/**
 * A new component to render the User Approval list
 */
function UserApprovalCard({
  users,
  onApprove,
  loading,
}: {
  users: AppUser[];
  onApprove: (userId: string) => void;
  loading: boolean;
}) {
  const pendingUsers = users.filter((u) => !u.isApproved);

  return (
    <div className="bg-card border rounded-lg overflow-hidden mb-8">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-foreground">
          Pending User Approvals ({pendingUsers.length})
        </h2>
      </div>
      {loading ? (
        <p className="p-6 text-muted-foreground">Loading user list...</p>
      ) : pendingUsers.length === 0 ? (
        <p className="p-6 text-muted-foreground">No users pending approval.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.userId} className="border-b hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm">{user.username}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onApprove(user.userId)}
                      className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null); // Admin user state
  const [userUsageList, setUserUsageList] = useState<UserUsageDocument[]>([]);
  const [allUsersList, setAllUsersList] = useState<AppUser[]>([]); // New state
  const [aggregatedUsage, setAggregatedUsage] =
    useState<AggregatedUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Listen for Admin auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchDashboardData(); // Fetch data once admin is logged in
      } else {
        // Clear all data if admin logs out
        setUserUsageList([]);
        setAllUsersList([]);
        setAggregatedUsage(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Main data fetching function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both sets of data in parallel
      const [usageData, allUsersData] = await Promise.all([
        getAllUserUsage(),
        getAllUsers(),
      ]);

      setUserUsageList(usageData);
      setAllUsersList(allUsersData); // Set users

      const aggregated = calculateAggregatedUsage(usageData);
      setAggregatedUsage(aggregated);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    fetchDashboardData(); // Just re-run the main fetch
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error during sign-in:', error);
      setError('Failed to sign in');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId);
      // Optimistically update the UI so it feels instant
      setAllUsersList(
        allUsersList.map((u) =>
          u.userId === userId ? { ...u, isApproved: true } : u
        )
      );
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user. Do you have admin permissions?');
    }
  };

  // --- Render Login Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Sign in with Google
          </button>
          {error && <p className="mt-4 text-sm text-red-800">{error}</p>}
        </div>
      </div>
    );
  }

  // --- Render Main Dashboard ---
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
        loading={loading}
      />

      {/* Sign Out Button */}
      <div className="container mx-auto py-4 px-4 flex justify-end items-center">
        <span className="text-sm text-muted-foreground mr-4">
          Signed in as: {user.email}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-primary hover:underline"
        >
          Sign Out
        </button>
      </div>

      <main className="container mx-auto py-8 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* New User Approval Card */}
        <UserApprovalCard
          users={allUsersList}
          onApprove={handleApproveUser}
          loading={loading}
        />

        {aggregatedUsage && (
          <>
            <OverviewCards
              aggregatedUsage={aggregatedUsage}
              loading={loading}
            />
            <UsageCharts userUsageList={userUsageList} loading={loading} />
            <UserUsageTable userUsageList={userUsageList} loading={loading} />
          </>
        )}

        {loading && userUsageList.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading usage data...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}