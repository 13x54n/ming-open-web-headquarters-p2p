# Pull-to-Refresh Functionality

This application now includes **native mobile-style pull-to-refresh functionality** that works on every page using the `use-pull-to-refresh` package.

## 🚀 Features

- **Global Pull-to-Refresh**: Works on all pages automatically
- **Next.js SSR Compatible**: Works with server-side rendering
- **React 19 Support**: Fully compatible with latest React version
- **Smart Refresh Logic**: Different behavior for different page types
- **Visual Feedback**: Clear indicators and loading states

## 📱 How It Works

### For Users:
1. **Pull down** on any page when at the top
2. **See visual feedback** with rotating refresh icon
3. **Release** when you see the icon reaches the threshold
4. **Watch smooth animations** during refresh
5. **See** updated content with toast notifications

### Technical Implementation:
- **Package**: `use-pull-to-refresh` - React 19 compatible hook
- **Component**: `GlobalPullToRefresh` - Applied to root layout
- **Event System**: Custom `app:refresh` events for page-specific refresh

## 🎯 Page-Specific Behavior

### Smart Refresh Pages (No Page Reload):
- `/wallet` - Refreshes token balances
- `/transactions` - Refreshes transaction data
- `/dashboard` - Refreshes dashboard data

### Standard Refresh Pages (Full Page Reload):
- All other pages use standard page refresh

## 🎨 Visual Experience

### **Pull States:**
- **Initial Pull**: Refresh icon appears and rotates smoothly
- **Progress**: Icon moves down as you pull (with resistance)
- **Threshold Reached**: Ready to trigger refresh
- **Refreshing**: Smooth loading spinner animation

### **Configuration:**
- **Maximum Pull Length**: 200px for natural feel
- **Refresh Threshold**: 70px to trigger refresh
- **Visual Indicator**: Centered floating icon with backdrop blur

## 🛠️ Adding Pull-to-Refresh to New Pages

### Listen to Global Refresh Events:
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

## ⚙️ Configuration

The pull-to-refresh is configured with these settings:

```tsx
const { isRefreshing, pullPosition } = usePullToRefresh({
  onRefresh: handleRefresh,
  maximumPullLength: 200,    // Maximum pull distance
  refreshThreshold: 70,       // Distance to trigger refresh
  isDisabled: false          // Enable/disable functionality
});
```

## 🎨 Customization

### Visual Indicators:
- **Refresh Icon**: Rotates smoothly as user pulls down
- **Loading Spinner**: Shows during refresh operation
- **Floating Design**: Centered with backdrop blur effect
- **Smooth Transitions**: 200ms duration for all animations

### Styling:
- **Primary Colors**: Uses your app's primary color scheme
- **Backdrop Blur**: Modern glass-morphism effect
- **Shadow Effects**: Subtle shadows for depth
- **Responsive Design**: Works on all screen sizes

## 🔧 Troubleshooting

### Common Issues:
1. **Not working on mobile**: Ensure touch events are enabled
2. **Scroll conflicts**: Only works when at top of page
3. **Performance**: Uses efficient touch event handling

### Debug Mode:
Add this to see pull-to-refresh state:
```tsx
console.log('Pull position:', pullPosition, 'Refreshing:', isRefreshing);
```

## 📱 Mobile Optimization

- **Touch Events**: Optimized for mobile devices
- **Smooth Animations**: Hardware-accelerated transitions
- **Natural Feel**: Realistic pull resistance and thresholds
- **Performance**: Efficient event handling and rendering

## 🚀 Technical Features

### **Package Benefits:**
- **React 19 Compatible**: Latest React version support
- **Next.js SSR Support**: Works with server-side rendering
- **TypeScript Support**: Full type safety
- **Lightweight**: Minimal bundle impact

### **Event System:**
- **Custom Events**: `app:refresh` for page communication
- **Async Handling**: Proper timing for refresh operations
- **Error Handling**: Fallback to page reload if needed
- **Page Detection**: Smart refresh logic per page type

## 🎯 Future Enhancements

- [x] Global pull-to-refresh functionality
- [x] React 19 compatibility
- [x] Next.js SSR support
- [x] Page-specific refresh logic
- [ ] Haptic feedback on mobile devices
- [ ] Custom refresh animations per page
- [ ] Pull-to-refresh for horizontal scrolling
- [ ] Accessibility improvements for screen readers
