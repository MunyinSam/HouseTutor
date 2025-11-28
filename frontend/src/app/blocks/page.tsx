'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import React from 'react';

const BlocksPage = () => {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-8">
			<h1 className="text-3xl font-bold mb-8">Blocks</h1>
			<div className="flex flex-col gap-4 w-full max-w-xs">
				<Button
					className="w-full"
					onClick={() => router.push('/blocks/minigame')}
				>
					Start Minigame
				</Button>
				<Button
					className="w-full"
					variant="secondary"
					onClick={() => router.push('/blocks/create')}
				>
					Create Topics & Questions
				</Button>
			</div>
		</div>
	);
};

export default BlocksPage;
