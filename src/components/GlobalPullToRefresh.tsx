'use client';

import { usePullToRefresh } from 'use-pull-to-refresh';
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

	const { isRefreshing, pullPosition } = usePullToRefresh({
		onRefresh: handleRefresh,
		maximumPullLength: 100,
		refreshThreshold: 50,
		isDisabled: false
	});

	return (
		<>
			{/* Pull to refresh indicator */}
			<div
				style={{
					top: (isRefreshing ? 70 : pullPosition) / 3,
					opacity: isRefreshing || pullPosition > 0 ? 1 : 0
				}}
				className="fixed inset-x-1/2 z-150 h-12 w-12 -translate-x-1/2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg transition-all duration-200"
			>
				<div
					className={`h-6 w-6 text-primary transition-all duration-200 ${
						isRefreshing ? 'animate-spin' : ''
					}`}
					style={
						!isRefreshing
							? { transform: `rotate(${Math.min(pullPosition * 2, 180)}deg)` }
							: {}
					}
				>
					{isRefreshing ? (
						<Loader2 className="h-6 w-6" />
					) : (
						<RefreshCw className="h-6 w-6" />
					)}
				</div>
			</div>

			{children}
		</>
	);
}
