# Pull-to-Refresh Functionality

This application now includes native mobile-style pull-to-refresh functionality that works on every page.

## 🚀 Features

- **Global Pull-to-Refresh**: Works on all pages automatically
- **Native Mobile Feel**: Smooth animations and resistance like iOS/Android apps
- **Smart Refresh Logic**: Different behavior for different page types
- **Visual Feedback**: Clear indicators and loading states

## 📱 How It Works

### For Users:
1. **Pull down** on any page when at the top
2. **Release** when you see "Release to refresh"
3. **Wait** for the refresh to complete
4. **See** updated content

### Technical Implementation:
- **Hook**: `usePullToRefresh` - Handles touch events and state
- **Component**: `PullToRefresh` - Visual indicator component
- **Global Wrapper**: `GlobalPullToRefresh` - Applied to root layout

## 🎯 Page-Specific Behavior

### Smart Refresh Pages (No Page Reload):
- `/wallet` - Refreshes token balances
- `/transactions` - Refreshes transaction data
- `/dashboard` - Refreshes dashboard data

### Standard Refresh Pages (Full Page Reload):
- All other pages use standard page refresh

## 🛠️ Adding Pull-to-Refresh to New Pages

### Option 1: Listen to Global Refresh Events
```tsx
import { useEffect } from 'react';

export default function MyPage() {
  useEffect(() => {
    const handleRefresh = () => {
      // Your refresh logic here
      refreshData();
    };

    window.addEventListener('app:refresh', handleRefresh);
    return () => window.removeEventListener('app:refresh', handleRefresh);
  }, []);

  return <div>My Page Content</div>;
}
```

### Option 2: Use the Hook Directly
```tsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefresh } from '@/components/PullToRefresh';

export default function MyPage() {
  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: async () => {
      // Your custom refresh logic
      await refreshData();
    }
  });

  return (
    <>
      <PullToRefresh isRefreshing={isRefreshing} pullDistance={pullDistance} />
      <div>My Page Content</div>
    </>
  );
}
```

## ⚙️ Configuration Options

The `usePullToRefresh` hook accepts these options:

```tsx
const { isRefreshing, pullDistance } = usePullToRefresh({
  onRefresh: async () => { /* your logic */ },
  threshold: 40,           // Distance to trigger refresh (default: 40px)
  maxPullDistance: 100,    // Maximum pull distance (default: 100px)
  resistance: 0.5          // Pull resistance factor (default: 0.5)
});
```

## 🎨 Customization

### Visual Indicators:
- **Arrow Icon**: Rotates as user pulls down
- **Loading Spinner**: Shows during refresh
- **Text Messages**: "Pull down to refresh" → "Release to refresh" → "Refreshing..."

### Styling:
- Uses your app's primary color scheme
- Smooth transitions and animations
- Mobile-optimized touch interactions

## 🔧 Troubleshooting

### Common Issues:
1. **Not working on mobile**: Ensure touch events are enabled
2. **Scroll conflicts**: Only works when at top of page
3. **Performance issues**: Check for heavy operations in refresh handlers

### Debug Mode:
Add this to see pull-to-refresh state:
```tsx
console.log('Pull distance:', pullDistance, 'Refreshing:', isRefreshing);
```

## 📱 Mobile Optimization

- **Touch Events**: Optimized for mobile devices
- **Resistance**: Natural feel with pull resistance
- **Thresholds**: Appropriate trigger distances for mobile
- **Performance**: Smooth 60fps animations

## 🚀 Future Enhancements

- [ ] Haptic feedback on mobile devices
- [ ] Custom refresh animations per page
- [ ] Pull-to-refresh for horizontal scrolling
- [ ] Accessibility improvements for screen readers
