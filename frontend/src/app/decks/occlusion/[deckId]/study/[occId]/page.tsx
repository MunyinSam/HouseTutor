'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	ArrowLeft,
	RotateCcw,
	ChevronLeft,
	ChevronRight,
	Eye,
	EyeOff,
} from 'lucide-react';
import {
	OcclusionRect,
	useGetImageOcclusionById,
} from '@/services/imageOcclusion.service';

interface PageProps {
	params: Promise<{ deckId: string; occId: string }>;
}

export default function StudyOcclusionPage({ params }: PageProps) {
	const { deckId, occId } = use(params);
	const router = useRouter();
	const { data: session } = useSession();
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { data: occlusion, isLoading } = useGetImageOcclusionById(
		parseInt(occId)
	);

	// For "all" mode: track which tapes are revealed
	const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

	// For "one" mode: track current card index
	const [currentIndex, setCurrentIndex] = useState(0);

	// Track if answer is shown (for "one" mode)
	const [showAnswer, setShowAnswer] = useState(false);

	const imageUrl = occlusion?.imagePath
		? occlusion.imagePath.startsWith('http')
			? occlusion.imagePath
			: `/api/images/${occlusion.imagePath}`
		: null;

	const occlusionRects: OcclusionRect[] = Array.isArray(occlusion?.occlusions)
		? occlusion.occlusions
		: [];

	// Draw canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !imageUrl || !occlusion) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;

			// Draw image
			ctx.drawImage(img, 0, 0);

			if (occlusion.mode === 'all') {
				// All mode: draw all tapes, revealed ones are transparent
				occlusionRects.forEach((occ) => {
					const isRevealed = revealedIds.has(occ.id);

					if (!isRevealed) {
						// Draw solid tape
						ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
						ctx.fillRect(occ.x, occ.y, occ.width, occ.height);
						ctx.strokeStyle = '#2563eb';
						ctx.lineWidth = 2;
						ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);

						// Label
						ctx.fillStyle = '#ffffff';
						ctx.font = 'bold 16px Arial';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillText(
							occ.label || '?',
							occ.x + occ.width / 2,
							occ.y + occ.height / 2
						);
					} else {
						// Draw revealed indicator (light border)
						ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
						ctx.lineWidth = 3;
						ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);
					}
				});
			} else {
				// One mode: hide only the current tape
				const currentOcc = occlusionRects[currentIndex];
				if (currentOcc && !showAnswer) {
					ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
					ctx.fillRect(
						currentOcc.x,
						currentOcc.y,
						currentOcc.width,
						currentOcc.height
					);
					ctx.strokeStyle = '#dc2626';
					ctx.lineWidth = 2;
					ctx.strokeRect(
						currentOcc.x,
						currentOcc.y,
						currentOcc.width,
						currentOcc.height
					);

					ctx.fillStyle = '#ffffff';
					ctx.font = 'bold 16px Arial';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(
						currentOcc.label || '?',
						currentOcc.x + currentOcc.width / 2,
						currentOcc.y + currentOcc.height / 2
					);
				}
			}
		};
		img.src = imageUrl;
	}, [
		imageUrl,
		occlusion,
		revealedIds,
		currentIndex,
		showAnswer,
		occlusionRects,
	]);

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!occlusion || occlusion.mode !== 'all') return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;
		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		// Find clicked occlusion
		const clicked = occlusionRects.find(
			(occ) =>
				x >= occ.x &&
				x <= occ.x + occ.width &&
				y >= occ.y &&
				y <= occ.y + occ.height
		);

		if (clicked && !revealedIds.has(clicked.id)) {
			setRevealedIds(new Set([...revealedIds, clicked.id]));
		}
	};

	const handleReset = () => {
		setRevealedIds(new Set());
		setCurrentIndex(0);
		setShowAnswer(false);
	};

	const handleNext = () => {
		if (currentIndex < occlusionRects.length - 1) {
			setCurrentIndex(currentIndex + 1);
			setShowAnswer(false);
		}
	};

	const handlePrev = () => {
		if (currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
			setShowAnswer(false);
		}
	};

	const handleReveal = () => {
		setShowAnswer(true);
	};

	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">Please sign in to study</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">Loading...</p>
			</div>
		);
	}

	if (!occlusion) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">Occlusion not found</p>
			</div>
		);
	}

	const currentOcc = occlusionRects[currentIndex];
	const allRevealed = revealedIds.size === occlusionRects.length;

	return (
		<div className="min-h-screen bg-gray-900">
			{/* Header */}
			<div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							className="text-white hover:text-gray-300"
							onClick={() =>
								router.push(`/decks/occlusion/${deckId}`)
							}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back
						</Button>
						<h1 className="text-xl font-semibold text-white">
							{occlusion.title || 'Study Mode'}
						</h1>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={handleReset}
						className="border-gray-600 text-white hover:bg-gray-700"
					>
						<RotateCcw className="w-4 h-4 mr-2" />
						Reset
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
				{/* Instructions */}
				<div className="text-center mb-6">
					{occlusion.mode === 'all' ? (
						<p className="text-gray-400">
							Click on the blue tapes to reveal what&apos;s hidden
							underneath
						</p>
					) : (
						<p className="text-gray-400">
							Card {currentIndex + 1} of {occlusionRects.length} -{' '}
							{showAnswer
								? 'Answer revealed'
								: 'Click reveal to see the answer'}
						</p>
					)}
				</div>

				{/* Canvas Container */}
				<Card className="bg-gray-800 border-gray-700">
					<CardContent className="p-4 flex justify-center">
						<div className="relative overflow-auto max-h-[calc(100vh-300px)]">
							<canvas
								ref={canvasRef}
								onClick={handleCanvasClick}
								className="border border-gray-600 rounded max-w-full"
								style={{
									cursor:
										occlusion.mode === 'all'
											? 'pointer'
											: 'default',
								}}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Controls */}
				{occlusion.mode === 'all' ? (
					/* All mode controls */
					<div className="flex justify-center items-center gap-4 mt-6">
						<div className="text-gray-400">
							{revealedIds.size} / {occlusionRects.length}{' '}
							revealed
						</div>
						{allRevealed && (
							<span className="text-green-500 font-medium">
								✓ All revealed!
							</span>
						)}
					</div>
				) : (
					/* One mode controls */
					<div className="flex flex-col items-center gap-4 mt-6">
						{/* Answer area */}
						{currentOcc?.answer && (
							<div className="text-center">
								{showAnswer ? (
									<div className="bg-green-900/50 border border-green-600 rounded-lg px-6 py-4">
										<p className="text-green-400 text-sm mb-1">
											Answer:
										</p>
										<p className="text-white text-lg">
											{currentOcc.answer}
										</p>
									</div>
								) : (
									<Button
										size="lg"
										onClick={handleReveal}
										className="bg-blue-600 hover:bg-blue-700"
									>
										<Eye className="w-5 h-5 mr-2" />
										Reveal Answer
									</Button>
								)}
							</div>
						)}

						{/* Navigation */}
						<div className="flex items-center gap-4">
							<Button
								variant="outline"
								onClick={handlePrev}
								disabled={currentIndex === 0}
								className="border-gray-600 text-white hover:bg-gray-700"
							>
								<ChevronLeft className="w-5 h-5 mr-1" />
								Previous
							</Button>

							<span className="text-gray-400 px-4">
								{currentIndex + 1} / {occlusionRects.length}
							</span>

							<Button
								variant="outline"
								onClick={handleNext}
								disabled={
									currentIndex === occlusionRects.length - 1
								}
								className="border-gray-600 text-white hover:bg-gray-700"
							>
								Next
								<ChevronRight className="w-5 h-5 ml-1" />
							</Button>
						</div>

						{/* Completion */}
						{currentIndex === occlusionRects.length - 1 &&
							showAnswer && (
								<div className="text-center mt-4">
									<p className="text-green-500 font-medium mb-2">
										✓ You&apos;ve completed all cards!
									</p>
									<Button
										variant="outline"
										onClick={handleReset}
									>
										<RotateCcw className="w-4 h-4 mr-2" />
										Study Again
									</Button>
								</div>
							)}
					</div>
				)}
			</div>
		</div>
	);
}
