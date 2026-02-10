# Deutsche Master Analytics Implementation

This document describes the comprehensive analytics and logging system implemented for the Deutsche Master app.

## Overview

The analytics system tracks:
- **Page Views**: Which pages users visit, timestamp, and duration
- **Session Tracking**: When users enter the app, session duration, pages visited
- **User Activity**: Exercises completed, scores, XP earned, levels accessed
- **Device Info**: Screen size, browser type, mobile/desktop (no personal data)
- **Real-time Metrics**: Active sessions, top pages, completion rates

## Architecture

### Files Added

1. **src/utils/analytics.js** (620 lines)
   - Core analytics module
   - Tracks sessions, page views, and custom events
   - Handles offline event queue and syncing
   - Device detection and fingerprinting

2. **src/pages/AdminPage.jsx** (590 lines)
   - Admin dashboard (Italian UI)
   - Protected by email whitelist (`armandocesa@gmail.com`)
   - Shows key metrics, activity graphs, completion rates
   - Real-time data with configurable refresh interval

3. **firestore.rules**
   - Firestore security rules for analytics collection
   - Allows authenticated users to write analytics data
   - Admin-only reads for aggregated stats

### Files Modified

1. **src/App.jsx**
   - Added AdminPage import and lazy loading
   - Added `trackPageView()` call in navigate function
   - Added 'admin' to validPages list
   - Added useEffect import and analytics import

2. **src/main.jsx**
   - Initialize session on app load: `initSession()`
   - Setup beforeunload handler: `endSession()`
   - Periodic sync of queued events (30 second interval)

3. **src/pages/ProfilePage.jsx**
   - Added ADMIN_EMAILS constant
   - Added admin button for authorized users
   - Only visible if user email is in ADMIN_EMAILS list

4. **src/utils/cloudSync.js**
   - Added writeBatch import
   - Added batchWrite() utility function for efficient Firestore writes

## Firestore Structure

```
analytics/
├── sessions/{sessionId}
│   ├── userId: string
│   ├── startTime: timestamp
│   ├── endTime: timestamp
│   ├── duration: number (milliseconds)
│   ├── pagesVisited: [{page, enterTime, exitTime, duration}]
│   ├── device: {type, screenWidth, screenHeight, browser, userAgent}
│   └── country: string
│
├── pageViews/{docId}
│   ├── page: string
│   ├── userId: string
│   ├── sessionId: string
│   ├── timestamp: timestamp
│   └── device: string (mobile|desktop)
│
├── events/{docId}
│   ├── eventName: string (quiz_completed, exercise_completed, story_completed, etc.)
│   ├── userId: string
│   ├── sessionId: string
│   ├── page: string
│   ├── timestamp: timestamp
│   └── data: object (custom event data)
│
└── dailyStats/{date}
    ├── date: string (YYYY-MM-DD)
    ├── totalSessions: number
    ├── uniqueUsers: array<string>
    ├── pageViews: {page: count, ...}
    ├── avgSessionDuration: number
    └── lastUpdated: timestamp
```

## Usage

### 1. Initialize Session (Automatic)
Called on app load in `main.jsx`:
```javascript
import { initSession } from './utils/analytics';

initSession();
```

### 2. Track Page Views (Automatic)
Called when user navigates to a new page in `App.jsx`:
```javascript
import { trackPageView } from './utils/analytics';

// In navigate callback
trackPageView(pageName);
```

### 3. Track Custom Events
Use in any component when activity occurs:
```javascript
import { trackEvent } from './utils/analytics';

// Quiz completion
trackEvent('quiz_completed', {
  level: selectedLevel,
  score: correctAnswers,
  totalQuestions: totalAnswered,
});

// Exercise completion
trackEvent('exercise_completed', {
  module: moduleName,
  score: percentCorrect,
});

// Story completion
trackEvent('story_completed', {
  storyTitle: title,
  readingTime: durationInSeconds,
});
```

### 4. End Session (Automatic)
Called on window unload in `main.jsx`:
```javascript
import { endSession } from './utils/analytics';

window.addEventListener('beforeunload', () => {
  endSession();
});
```

### 5. Sync Queued Events (Automatic)
Periodic sync every 30 seconds:
```javascript
import { syncQueuedEvents } from './utils/analytics';

setInterval(() => {
  syncQueuedEvents();
}, 30000);
```

## Admin Dashboard

Access the admin dashboard at `/admin` (automatically routed).

### Features

**Key Metrics:**
- Sessions today, this week, this month
- Unique users per period
- New registrations
- Average session duration

**Visualizations:**
- Bar charts for most visited pages
- Exercise completion rates breakdown
- Detailed page visit counts
- Weekly trends

**Configuration:**
- Auto-refresh interval: 15s, 30s, 1m, 5m
- Real-time data updates
- Export-ready metrics

### Access Control

Only users with email `armandocesa@gmail.com` can access the admin panel.
Other authenticated users see an "Access Denied" message.

## Device Detection

The system captures:
- Device type: `mobile` or `desktop`
- Screen dimensions: width and height
- Browser: Chrome, Firefox, Safari, Edge, Opera
- User agent (for advanced analysis)
- Language/locale from navigator

**No personal data** is collected (no IP, location, tracking IDs).

## Offline Support

Events are automatically queued if:
- User is not authenticated
- Network request fails
- Firestore is unavailable

Queue is synchronized:
- On successful login
- Every 30 seconds (if online)
- When app closes (beforeunload)

## Performance Considerations

1. **Batch Writes**: Multiple events are batched to reduce Firestore quota usage
2. **Code Splitting**: AdminPage is lazy-loaded only when needed
3. **Minimal Payload**: Events contain only essential data
4. **Efficient Queries**: Daily stats aggregation happens server-side

## Security Rules

Firebase Security Rules require:
- **Authentication**: Users must be logged in to write analytics
- **Data Ownership**: Users can only modify their own session data
- **Admin Access**: Only admin email can read aggregated stats

Deploy rules with:
```bash
firebase deploy --only firestore:rules
```

See `firestore.rules` for complete rule set.

## Event Types

Common events to track:

```javascript
// Learning activities
trackEvent('quiz_completed', { level, score, totalQuestions });
trackEvent('exercise_completed', { module, type, score });
trackEvent('story_completed', { storyTitle, readingTime });
trackEvent('flashcard_studied', { deck, cardCount });

// Progress
trackEvent('level_unlocked', { level });
trackEvent('achievement_unlocked', { achievementName });
trackEvent('xp_earned', { amount, source });

// Engagement
trackEvent('favorites_added', { wordId, category });
trackEvent('settings_changed', { setting, oldValue, newValue });
```

## Limitations

- Anonymous users' analytics are not persisted (queue only)
- Real-time dashboard shows aggregated data with slight delay
- Firestore free tier limits: ~1.2M reads/month recommended
- Browser storage limits queue to ~50 events

## Future Enhancements

- [ ] Real-time session monitoring
- [ ] Cohort analysis (user groups)
- [ ] Funnel analysis (path to completion)
- [ ] A/B testing framework
- [ ] Custom event export
- [ ] Email report scheduling
- [ ] Machine learning anomaly detection

## Debugging

Enable console logging:
```javascript
// In browser console
localStorage.setItem('dm_analytics_debug', 'true');
```

Check event queue:
```javascript
// In browser console
import('./utils/analytics').then(a => console.log(a.eventQueue));
```

## Support

For issues or questions:
- Check browser console for errors
- Verify Firestore security rules
- Ensure user is authenticated for tracking
- Check network tab for failed requests
