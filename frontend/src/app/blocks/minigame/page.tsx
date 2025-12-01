import { Suspense } from 'react';
import MinigameClient from './minigame-client';

export default function MinigamePageWrapper() {
	// This is a Server Component. It wraps the client-side logic in Suspense.
	return (
		// The fallback provides content while the search params are being determined
		<Suspense
			fallback={
				<div className="flex justify-center items-center h-screen">
					Loading game...
				</div>
			}
		>
			<MinigameClient />
		</Suspense>
	);
};

