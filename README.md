# OpenAI Usage Dashboard

A Next.js dashboard for monitoring and tracking OpenAI API usage and costs across all users.

## Features

- **Real-time Usage Monitoring**: View total API usage, costs, and token consumption
- **Per-User Analytics**: Track individual user usage patterns and costs
- **Cost Analysis**: Visualize costs by model and over time
- **API Call Tracking**: Monitor API call frequency and trends
- **Interactive Charts**: Beautiful visualizations using Recharts
- **Auto-refresh**: Data updates every 30 seconds
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Firestore database
- Same Firebase credentials as your main chatbot frontend

## Setup Instructions

### 1. Install Dependencies

```bash
cd dashboard
npm install
```

### 2. Configure Firebase Credentials

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase credentials (same as your frontend project):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 3. Update Firestore Security Rules

Make sure your Firestore security rules allow reading from the `usage` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usage collection - allow read access
    match /usage/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

### 4. Run the Dashboard

Development mode:

```bash
npm run dev
```

The dashboard will be available at `http://localhost:3001`

Production build:

```bash
npm run build
npm start
```

## Project Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── DashboardHeader.tsx # Header with refresh button
│   │   ├── OverviewCards.tsx   # Summary cards
│   │   ├── UsageCharts.tsx     # Chart visualizations
│   │   └── UserUsageTable.tsx  # User usage table
│   ├── lib/
│   │   ├── firebase/
│   │   │   └── config.ts       # Firebase configuration
│   │   └── utils.ts            # Utility functions
│   ├── services/
│   │   └── usageService.ts     # Firestore data fetching
│   └── types/
│       └── usage.ts            # TypeScript types
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Data Structure

The dashboard reads from the Firestore `usage` collection with the following structure:

```typescript
{
  userId: string,
  totalCalls: number,
  totalInputTokens: number,
  totalOutputTokens: number,
  totalTokens: number,
  totalCostUsd: number,
  lastUpdated: Timestamp,
  createdAt: Timestamp,
  recentUsage: [
    {
      timestamp: Timestamp,
      model: string,
      inputTokens: number,
      outputTokens: number,
      totalTokens: number,
      costUsd: number,
      calls: number
    }
  ]
}
```

## Dashboard Sections

### Overview Cards
- **Total Cost**: Aggregate cost across all users
- **Total Calls**: Total number of API calls
- **Total Tokens**: Total tokens consumed
- **Active Users**: Number of users with usage data

### Charts
- **Cost by Model**: Bar chart showing cost breakdown by model
- **Cost Over Time**: Line chart showing cost trends over 30 days
- **Model Distribution**: Pie chart showing model usage distribution
- **API Calls Over Time**: Line chart showing call frequency

### Per-User Usage Table
- Sortable by cost, calls, or tokens
- Expandable rows showing detailed user information
- Recent usage entries for each user
- Cost per call metrics

## Features

- **Auto-refresh**: Data refreshes every 30 seconds
- **Manual refresh**: Click the Refresh button to update immediately
- **Error handling**: Displays error messages if data fetch fails
- **Loading states**: Shows loading indicators while fetching data
- **Responsive design**: Adapts to different screen sizes

## Troubleshooting

### "Missing or insufficient permissions" error

Make sure your Firestore security rules allow reading from the `usage` collection. Update your rules to include:

```javascript
match /usage/{userId} {
  allow read: if request.auth != null;
}
```

### No data showing

1. Verify Firebase credentials are correct in `.env.local`
2. Check that usage data exists in Firestore `usage` collection
3. Ensure Firestore security rules allow read access
4. Check browser console for error messages

### Charts not displaying

Make sure Recharts is properly installed:

```bash
npm install recharts
```

## Technologies Used

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Firebase**: Firestore database
- **Recharts**: Data visualization
- **Lucide React**: Icons

## License

MIT

