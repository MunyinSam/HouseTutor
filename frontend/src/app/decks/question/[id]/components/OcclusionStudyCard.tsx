'use client';

import { useRef, useEffect, useState } from 'react';
import { RotateCcw, Image as ImageIcon } from 'lucide-react';
import {
	ImageOcclusion,
	OcclusionRect,
} from '@/services/imageOcclusion.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OcclusionStudyCardProps {
	occlusion: ImageOcclusion;
	showAllAnswers: boolean;
}

export function OcclusionStudyCard({
	occlusion,
	showAllAnswers,
}: OcclusionStudyCardProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

	const imageUrl = occlusion.imagePath.startsWith('http')
		? occlusion.imagePath
		: `/api/images/${occlusion.imagePath}`;

	const occlusionRects: OcclusionRect[] = Array.isArray(occlusion.occlusions)
		? occlusion.occlusions
		: [];

	// Draw canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);

			// Draw occlusion rectangles
			occlusionRects.forEach((occ) => {
				const isRevealed = revealedIds.has(occ.id) || showAllAnswers;

				if (!isRevealed) {
					// Draw tape (fully opaque)
					ctx.fillStyle = 'rgb(59, 130, 246)';
					ctx.fillRect(occ.x, occ.y, occ.width, occ.height);
					ctx.strokeStyle = '#2563eb';
					ctx.lineWidth = 2;
					ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);

					// Label
					ctx.fillStyle = '#ffffff';
					ctx.font = 'bold 14px Arial';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(
						occ.label || '?',
						occ.x + occ.width / 2,
						occ.y + occ.height / 2
					);
				} else {
					// Revealed - show green border
					ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
					ctx.lineWidth = 3;
					ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);
				}
			});
		};
		img.src = imageUrl;
	}, [imageUrl, occlusionRects, revealedIds, showAllAnswers]);

	const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
	};

	const allRevealed = revealedIds.size === occlusionRects.length;

	return (
		<Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
			<CardHeader>
				<CardTitle className="text-xl flex items-center gap-2">
					<ImageIcon className="w-5 h-5 text-purple-600" />
					{occlusion.title || 'Image Occlusion'}
				</CardTitle>
				<p className="text-sm text-gray-500">
					Click on the blue tapes to reveal what&apos;s hidden
				</p>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="relative overflow-auto max-h-[500px]">
					<canvas
						ref={canvasRef}
						onClick={handleCanvasClick}
						className="border border-gray-300 rounded max-w-full cursor-pointer"
					/>
				</div>

				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">
						{revealedIds.size} / {occlusionRects.length} revealed
						{allRevealed && (
							<span className="text-green-600 ml-2">
								✓ All revealed!
							</span>
						)}
					</div>
					<Button variant="outline" size="sm" onClick={handleReset}>
						<RotateCcw className="w-4 h-4 mr-1" />
						Reset
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
