'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { useGetTopics } from '@/services/topic';
import { Combobox } from '@/components/ui/combobox';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Navbar } from '@/components/navbar';
import Image from 'next/image';

type Topic = { id: number; name: string; description?: string };

const BlocksPage = () => {
	const router = useRouter();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
	const { data: topics, isLoading: topicsLoading } = useGetTopics();

	const handleStartMinigame = () => {
		setDialogOpen(true);
	};

	const handleConfirm = () => {
		if (selectedTopics.length > 0) {
			router.push(`/blocks/minigame?topicId=${selectedTopics.join(',')}`);
			setDialogOpen(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col overflow-x-hidden">
			<Navbar />
			<div className="flex flex-col items-center justify-center min-h-screen gap-8 relative">
				<Image
					alt="House Tutor"
					className="object-cover -z-10 scale-100 object-center"
					src="/house1.jpg"
					fill
					priority
				/>
				<h1 className="text-3xl font-bold mb-8 text-white">
					Curing Your Ignorance
				</h1>
				<div className="flex flex-col gap-4 w-full max-w-xs">
					<Button
						className="w-full cursor-pointer bg-gray-200 text-black hover:bg-gray-600"
						onClick={handleStartMinigame}
					>
						Start Quiz
					</Button>
					<Button
						className="w-full cursor-pointer text-black hover:bg-gray-600"
						variant="secondary"
						onClick={() => router.push('/blocks/create')}
					>
						<div className="text-xs">
							{' '}
							Document Your Mistakes (Topics & Questions)
						</div>
					</Button>
				</div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogContent>
						<DialogTitle>
							Pick Your Poison (Topic Selection)
						</DialogTitle>
						{topicsLoading ? (
							<div>
								Waiting for the data... Try not to break
								anything.
							</div>
						) : (
							<>
								<Combobox
									options={
										topics?.map((t: Topic) => ({
											label: t.name,
											value: String(t.id),
										})) || []
									}
									value={null}
									onChange={(val) => {
										if (
											val &&
											!selectedTopics.includes(val)
										) {
											setSelectedTopics((prev) => [
												...prev,
												val,
											]);
										}
									}}
									placeholder="Select the source of your confusion"
								/>
								<div className="flex flex-wrap gap-2 mt-2">
									{selectedTopics.map((id) => {
										const topic = topics.find(
											(t: Topic) => String(t.id) === id
										);
										return (
											<span
												key={id}
												className="inline-flex items-center px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
											>
												{topic?.name || id}
												<button
													type="button"
													className="ml-1 text-blue-800 hover:text-red-600"
													onClick={() =>
														setSelectedTopics(
															(prev) =>
																prev.filter(
																	(tid) =>
																		tid !==
																		id
																)
														)
													}
													aria-label="Remove"
												>
													×
												</button>
											</span>
										);
									})}
								</div>
							</>
						)}
						<DialogFooter>
							<Button
								onClick={handleConfirm}
								disabled={selectedTopics.length === 0}
							>
								Start Treatment
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
};

export default BlocksPage;
