'use client';

import PullToRefresh from 'react-simple-pull-to-refresh';
import { Loader2, RefreshCw } from 'lucide-react';

interface GlobalPullToRefreshProps {
	children: React.ReactNode;
}

export function GlobalPullToRefresh({ children }: GlobalPullToRefreshProps) {
	const handleRefresh = async () => {
		try {
			if (typeof window !== 'undefined') {
				// Notify pages/contexts to refresh their data
				window.dispatchEvent(new CustomEvent('app:refresh'));
				// Give listeners time to finish their work
				await new Promise(resolve => setTimeout(resolve, 800));

				const currentPath = window.location.pathname;
				// Avoid full reload on pages that can soft-refresh
				if (currentPath === '/wallet' || currentPath === '/transactions' || currentPath === '/dashboard') {
					return;
				}
			}
			// Fallback to a full reload elsewhere
			window.location.reload();
		} catch {
			window.location.reload();
		}
	};

	return (
		<PullToRefresh
			onRefresh={handleRefresh}
			pullDownThreshold={70}
			maxPullDownDistance={200}
			resistance={1}
			backgroundColor="transparent"
			pullingContent={(
				<div className="flex items-center justify-center gap-2 py-2 text-primary">
					<RefreshCw className="w-4 h-4 animate-pulse" />
					<span className="text-sm">Pull down to refresh</span>
				</div>
			)}
			refreshingContent={(
				<div className="flex items-center justify-center gap-2 py-2 text-primary">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span className="text-sm">Refreshing...</span>
				</div>
			)}
		>
			{children}
		</PullToRefresh>
	);
}
