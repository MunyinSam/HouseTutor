'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	ArrowLeft,
	Plus,
	Trash2,
	Save,
	Upload,
	Square,
	MousePointer,
} from 'lucide-react';
import {
	OcclusionRect,
	useCreateImageOcclusion,
} from '@/services/imageOcclusion.service';

interface PageProps {
	params: Promise<{ deckId: string }>;
}

export default function CreateOcclusionPage({ params }: PageProps) {
	const { deckId } = use(params);
	const router = useRouter();
	const { data: session } = useSession();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [title, setTitle] = useState('');
	const [mode, setMode] = useState<'all' | 'one'>('all');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
	const [occlusions, setOcclusions] = useState<OcclusionRect[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
	const [tool, setTool] = useState<'select' | 'draw'>('draw');

	const { mutate: createOcclusion, isPending } = useCreateImageOcclusion();

	// Load image when file is selected
	useEffect(() => {
		if (imageFile) {
			const url = URL.createObjectURL(imageFile);
			const img = new Image();
			img.onload = () => {
				setImageSize({ width: img.width, height: img.height });
				setImageUrl(url);
			};
			img.src = url;
			return () => URL.revokeObjectURL(url);
		}
	}, [imageFile]);

	console.log('test');

	// Draw canvas
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !imageUrl) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			// Set canvas size to image size
			canvas.width = img.width;
			canvas.height = img.height;

			// Draw image
			ctx.drawImage(img, 0, 0);

			// Draw occlusions
			occlusions.forEach((occ) => {
				const isSelected = occ.id === selectedId;

				// Fill
				ctx.fillStyle = isSelected
					? 'rgba(239, 68, 68, 0.7)'
					: 'rgba(59, 130, 246, 0.7)';
				ctx.fillRect(occ.x, occ.y, occ.width, occ.height);

				// Border
				ctx.strokeStyle = isSelected ? '#dc2626' : '#2563eb';
				ctx.lineWidth = isSelected ? 3 : 2;
				ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);

				// Label
				if (occ.label) {
					ctx.fillStyle = '#ffffff';
					ctx.font = 'bold 14px Arial';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText(
						occ.label,
						occ.x + occ.width / 2,
						occ.y + occ.height / 2
					);
				}
			});
		};
		img.src = imageUrl;
	}, [imageUrl, occlusions, selectedId]);

	const getCanvasCoordinates = (
		e: React.MouseEvent<HTMLCanvasElement>
	): { x: number; y: number } => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };

		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		return {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};
	};

	const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
		const { x, y } = getCanvasCoordinates(e);

		if (tool === 'select') {
			// Find clicked occlusion
			const clicked = occlusions.find(
				(occ) =>
					x >= occ.x &&
					x <= occ.x + occ.width &&
					y >= occ.y &&
					y <= occ.y + occ.height
			);
			setSelectedId(clicked?.id || null);
		} else {
			// Start drawing
			setIsDrawing(true);
			setDrawStart({ x, y });
		}
	};

	const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDrawing || tool !== 'draw') return;

		const { x, y } = getCanvasCoordinates(e);
		const canvas = canvasRef.current;
		if (!canvas || !imageUrl) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Redraw image and existing occlusions
		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0);

			occlusions.forEach((occ) => {
				ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
				ctx.fillRect(occ.x, occ.y, occ.width, occ.height);
				ctx.strokeStyle = '#2563eb';
				ctx.lineWidth = 2;
				ctx.strokeRect(occ.x, occ.y, occ.width, occ.height);
			});

			// Draw current rectangle
			const width = x - drawStart.x;
			const height = y - drawStart.y;
			ctx.fillStyle = 'rgba(34, 197, 94, 0.5)';
			ctx.fillRect(drawStart.x, drawStart.y, width, height);
			ctx.strokeStyle = '#16a34a';
			ctx.lineWidth = 2;
			ctx.strokeRect(drawStart.x, drawStart.y, width, height);
		};
		img.src = imageUrl;
	};

	const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (!isDrawing || tool !== 'draw') return;

		const { x, y } = getCanvasCoordinates(e);
		const width = Math.abs(x - drawStart.x);
		const height = Math.abs(y - drawStart.y);

		// Only add if rectangle is large enough
		if (width > 10 && height > 10) {
			const newOcclusion: OcclusionRect = {
				id: `occ-${Date.now()}`,
				x: Math.min(drawStart.x, x),
				y: Math.min(drawStart.y, y),
				width,
				height,
				label: `${occlusions.length + 1}`,
				answer: '',
			};
			setOcclusions([...occlusions, newOcclusion]);
			setSelectedId(newOcclusion.id);
		}

		setIsDrawing(false);
	};

	const handleDeleteSelected = () => {
		if (selectedId) {
			setOcclusions(occlusions.filter((occ) => occ.id !== selectedId));
			setSelectedId(null);
		}
	};

	const handleUpdateOcclusion = (
		id: string,
		updates: Partial<OcclusionRect>
	) => {
		setOcclusions(
			occlusions.map((occ) =>
				occ.id === id ? { ...occ, ...updates } : occ
			)
		);
	};

	const handleSave = () => {
		if (!imageFile || occlusions.length === 0) {
			alert('Please upload an image and add at least one occlusion');
			return;
		}

		createOcclusion(
			{
				deckId: parseInt(deckId),
				title: title || 'Untitled Occlusion',
				occlusions,
				mode,
				image: imageFile,
			},
			{
				onSuccess: () => {
					router.push(`/decks/occlusion/${deckId}`);
				},
				onError: (error) => {
					console.error('Failed to create occlusion:', error);
					alert('Failed to create occlusion');
				},
			}
		);
	};

	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">
					Please sign in to create occlusions
				</p>
			</div>
		);
	}

	const selectedOcclusion = occlusions.find((occ) => occ.id === selectedId);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b px-6 py-4">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								router.push(`/decks/occlusion/${deckId}`)
							}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back
						</Button>
						<h1 className="text-xl font-semibold">
							Create Image Occlusion
						</h1>
					</div>
					<Button
						onClick={handleSave}
						disabled={isPending || !imageFile}
					>
						<Save className="w-4 h-4 mr-2" />
						{isPending ? 'Saving...' : 'Save'}
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Left Panel - Settings */}
					<div className="space-y-4">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium">
									Settings
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										placeholder="Enter title..."
									/>
								</div>

								<div>
									<Label>Study Mode</Label>
									<Select
										value={mode}
										onValueChange={(v) =>
											setMode(v as 'all' | 'one')
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">
												Hide All, Reveal One
											</SelectItem>
											<SelectItem value="one">
												Hide One, Show Others
											</SelectItem>
										</SelectContent>
									</Select>
									<p className="text-xs text-gray-500 mt-1">
										{mode === 'all'
											? 'All tapes are hidden, click to reveal each'
											: 'Each card hides one tape at a time'}
									</p>
								</div>

								<div>
									<Label>Image</Label>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={(e) =>
											setImageFile(
												e.target.files?.[0] || null
											)
										}
										className="hidden"
									/>
									<Button
										variant="outline"
										className="w-full mt-1"
										onClick={() =>
											fileInputRef.current?.click()
										}
									>
										<Upload className="w-4 h-4 mr-2" />
										{imageFile
											? 'Change Image'
											: 'Upload Image'}
									</Button>
									{imageFile && (
										<p className="text-xs text-gray-500 mt-1 truncate">
											{imageFile.name}
										</p>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium">
									Tools
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									variant={
										tool === 'select'
											? 'default'
											: 'outline'
									}
									className="w-full justify-start"
									onClick={() => setTool('select')}
								>
									<MousePointer className="w-4 h-4 mr-2" />
									Select
								</Button>
								<Button
									variant={
										tool === 'draw' ? 'default' : 'outline'
									}
									className="w-full justify-start"
									onClick={() => setTool('draw')}
								>
									<Square className="w-4 h-4 mr-2" />
									Draw Tape
								</Button>
							</CardContent>
						</Card>

						{/* Selected Occlusion Details */}
						{selectedOcclusion && (
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="text-sm font-medium flex items-center justify-between">
										Selected Tape
										<Button
											variant="ghost"
											size="sm"
											onClick={handleDeleteSelected}
										>
											<Trash2 className="w-4 h-4 text-red-500" />
										</Button>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div>
										<Label>Label</Label>
										<Input
											value={selectedOcclusion.label}
											onChange={(e) =>
												handleUpdateOcclusion(
													selectedOcclusion.id,
													{
														label: e.target.value,
													}
												)
											}
											placeholder="Label..."
										/>
									</div>
									<div>
										<Label>
											Answer (shown after reveal)
										</Label>
										<Input
											value={
												selectedOcclusion.answer || ''
											}
											onChange={(e) =>
												handleUpdateOcclusion(
													selectedOcclusion.id,
													{
														answer: e.target.value,
													}
												)
											}
											placeholder="Optional answer..."
										/>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Panel - Canvas */}
					<div className="lg:col-span-3">
						<Card className="h-full">
							<CardContent className="p-4">
								{imageUrl ? (
									<div className="relative overflow-auto max-h-[calc(100vh-200px)]">
										<canvas
											ref={canvasRef}
											onMouseDown={handleCanvasMouseDown}
											onMouseMove={handleCanvasMouseMove}
											onMouseUp={handleCanvasMouseUp}
											onMouseLeave={() =>
												setIsDrawing(false)
											}
											className="border rounded cursor-crosshair max-w-full"
											style={{
												cursor:
													tool === 'select'
														? 'pointer'
														: 'crosshair',
											}}
										/>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
										<Upload className="w-12 h-12 text-gray-400 mb-4" />
										<p className="text-gray-500 mb-4">
											Upload an image to get started
										</p>
										<Button
											variant="outline"
											onClick={() =>
												fileInputRef.current?.click()
											}
										>
											<Plus className="w-4 h-4 mr-2" />
											Choose Image
										</Button>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>

				{/* Occlusions List */}
				{occlusions.length > 0 && (
					<Card className="mt-6">
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">
								Occlusions ({occlusions.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{occlusions.map((occ) => (
									<Button
										key={occ.id}
										variant={
											selectedId === occ.id
												? 'default'
												: 'outline'
										}
										size="sm"
										onClick={() => {
											setSelectedId(occ.id);
											setTool('select');
										}}
									>
										{occ.label || 'Untitled'}
									</Button>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
