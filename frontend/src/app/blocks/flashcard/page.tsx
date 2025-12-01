import React, { Suspense } from 'react';
import FlashCardClient from './flahscard-client';

export default function FlashCardPage() {
	return (
		<Suspense
			fallback={
				<div className="flex justify-center items-center h-screen">
					Loading...
				</div>
			}
		>
			<FlashCardClient />
		</Suspense>
	);
}
