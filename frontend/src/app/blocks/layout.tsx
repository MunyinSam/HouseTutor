'use client';

import { Navbar } from '@/components/navbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<div className="flex h-screen flex-col overflow-hidden">
				<Navbar />
				{children}
			</div>
		</QueryClientProvider>
	);
}
