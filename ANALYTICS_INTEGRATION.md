# Analytics Integration Guide

## What Was Added

### 1. New Files Created

#### A. `/src/utils/analytics.js` (620 lines)
Core analytics module with:
- `initSession()` - Called on app load
- `trackPageView(pageName)` - Called on navigation
- `trackEvent(eventName, data)` - Called for custom events
- `endSession()` - Called on window unload
- `syncQueuedEvents()` - Syncs offline events when online
- `getAnalyticsSummary()` - Fetches data for admin dashboard
- `getMostVisitedPages()` - Top pages ranking
- `getExerciseCompletionRates()` - Activity metrics

#### B. `/src/pages/AdminPage.jsx` (590 lines)
Admin analytics dashboard with:
- Protected access (email whitelist)
- Key metrics display
- Most visited pages chart
- Exercise completion breakdown
- Real-time active sessions counter
- Configurable auto-refresh (15s-5m)
- Beautiful dark theme UI
- Italian language labels

#### C. `/firestore.rules`
Firestore security rules:
- Allow authenticated users to write analytics
- Allow analytics reads for dashboard
- Protect sensitive data with ownership checks

#### D. `/ANALYTICS.md`
Complete documentation:
- Architecture overview
- Firestore data structure
- Usage examples
- Admin dashboard features
- Security considerations

### 2. Files Modified

#### A. `src/App.jsx`
```javascript
// Added imports
import { trackPageView } from './utils/analytics';

// Added to navigate callback
trackPageView(page);

// Added lazy load
const AdminPage = React.lazy(() => import('./pages/AdminPage'));

// Added to validPages
validPages.push('admin');

// Added page rendering
{currentPage === 'admin' && <AdminPage onNavigate={navigate} />}
```

#### B. `src/main.jsx`
```javascript
// Added imports
import { initSession, endSession, syncQueuedEvents } from './utils/analytics';

// Initialize on load
initSession();

// Setup unload handler
window.addEventListener('beforeunload', () => {
  endSession();
  syncQueuedEvents();
});

// Periodic sync
setInterval(() => {
  syncQueuedEvents();
}, 30000);
```

#### C. `src/pages/ProfilePage.jsx`
```javascript
// Added admin emails constant
const ADMIN_EMAILS = ['armandocesa@gmail.com'];

// Added admin button for authorized users
{ADMIN_EMAILS.includes(user?.email) && (
  <button onClick={() => onNavigate('admin')}>
    ⚙️ Admin
  </button>
)}
```

#### D. `src/utils/cloudSync.js`
```javascript
// Added writeBatch import
import { writeBatch } from 'firebase/firestore';

// Added batchWrite utility
export async function batchWrite(operations) {
  const batch = writeBatch(db);
  await operations(batch);
  await batch.commit();
}
```

## How to Use

### 1. Automatic Tracking (Already Set Up)

**Session Tracking:**
- Automatically initialized on app load
- Automatically ended on page close
- Tracks all page views
- Captures device info and duration

**Page Views:**
- Automatically tracked on navigation
- Includes entry/exit times and duration per page
- Stored in Firestore immediately (or queued if offline)

### 2. Add Custom Event Tracking

In any component where activity occurs:

```javascript
import { trackEvent } from '../utils/analytics';

// In quiz completion handler
trackEvent('quiz_completed', {
  level: selectedLevel,
  score: correctAnswers,
  totalQuestions: totalAnswered,
  duration: timeInSeconds,
});

// In exercise complete handler
trackEvent('exercise_completed', {
  module: moduleName,
  type: exerciseType,
  score: percentCorrect,
});

// In story complete handler
trackEvent('story_completed', {
  storyTitle: story.title,
  readingTime: durationInSeconds,
  comprehensionScore: score,
});

// In flashcard study handler
trackEvent('flashcard_studied', {
  deck: deckName,
  cardsStudied: count,
  accuracy: percentCorrect,
});
```

### 3. Access Admin Dashboard

1. **Login** with email: `armandocesa@gmail.com`
2. **Go to Profile** page
3. **Click "⚙️ Admin"** button (only visible for admin)
4. View analytics dashboard

Or navigate directly to `/admin` route

### 4. Configure Admin Access

Edit `ADMIN_EMAILS` in:
- `src/pages/ProfilePage.jsx`
- `src/pages/AdminPage.jsx`

Add more emails:
```javascript
const ADMIN_EMAILS = ['armandocesa@gmail.com', 'newadmin@example.com'];
```

## Firestore Setup

### 1. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

Rules file location: `/firestore.rules`

### 2. Verify Firestore Collections

After first login, you should see:
- `analytics/sessions/` - Session documents
- `analytics/pageViews/` - Page view logs
- `analytics/events/` - Custom event logs
- `analytics/dailyStats/` - Daily aggregated stats

### 3. Data Retention

Recommend setting TTL (Time To Live) in Firestore:
- pageViews: 90 days
- events: 90 days
- sessions: 30 days
- dailyStats: indefinite (yearly archive)

## Testing

### 1. Local Testing (No Auth)

Events are queued and logged to console:
```
Session initialized: session_1707512345...
Page view tracked: home
Event queued: quiz_completed
```

### 2. With Authentication

Events are immediately written to Firestore:
1. Login with any email
2. Navigate pages (check Firestore console)
3. Open DevTools → Application → Firestore (if using emulator)

### 3. Admin Dashboard

1. Login as `armandocesa@gmail.com`
2. Go to Profile → ⚙️ Admin
3. See dashboard with:
   - Total sessions count
   - Most visited pages
   - Exercise completion rates
   - Real-time metrics

## Performance Notes

**Build Size:**
- analytics.js: ~16 KB (minified)
- AdminPage.jsx: ~21 KB (minified)
- Total addition: ~37 KB (lazy-loaded, so doesn't impact initial load)

**Firestore Quota:**
- Each session: ~500 bytes
- Each page view: ~200 bytes
- Each event: ~300-500 bytes
- Each daily stat: ~500 bytes

At 1000 users/day with 5 pages per session:
- Estimated writes: ~5,500 documents/day
- Estimated reads: ~500 documents/day (admin dashboard)

## Troubleshooting

### 1. Admin button not appearing
- Check email in user profile
- Verify email is in ADMIN_EMAILS list
- Logout and login again

### 2. Events not showing in dashboard
- Check Firestore security rules are deployed
- Verify user is authenticated
- Check browser console for errors
- Wait 30 seconds for periodic sync

### 3. High Firestore costs
- Implement TTL on analytics collections
- Archive old data monthly
- Consider reducing event tracking frequency
- Use batch operations (already implemented)

### 4. Dashboard showing no data
- Ensure at least one session has completed
- Check browser has active internet connection
- Verify Firestore rules allow reads
- Clear browser cache and reload

## Next Steps

### Recommended Enhancements

1. **Add Event Tracking to Pages**
   - Quiz completion → trackEvent('quiz_completed')
   - Exercise done → trackEvent('exercise_completed')
   - Story finished → trackEvent('story_completed')
   - Level unlocked → trackEvent('level_unlocked')

2. **Enhanced Admin Dashboard**
   - Charts for event trends
   - User cohort analysis
   - Completion funnel visualization
   - Export to CSV/PDF

3. **User Retention**
   - Track days since last visit
   - Identify at-risk users
   - Send re-engagement notifications

4. **Performance Optimization**
   - Archive analytics after 90 days
   - Implement data compression
   - Use Firestore Analytics API

## Questions?

Refer to:
- `ANALYTICS.md` - Full documentation
- `src/utils/analytics.js` - Source code with JSDoc
- `src/pages/AdminPage.jsx` - Dashboard implementation
- Firestore console - View actual data

---

**Implementation Date:** February 9, 2026
**Version:** 1.0
**Status:** Production Ready
