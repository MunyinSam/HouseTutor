'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QuestionFormProps } from './types';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
	ClipboardPaste,
	X,
	CheckCircle,
	Image as ImageIcon,
} from 'lucide-react';

export function QuestionForm({
	front,
	setFront,
	back,
	setBack,
	explanation,
	setExplanation,
	image,
	setImage,
	currentImagePath,
}: QuestionFormProps) {
	const currentImageUrl = currentImagePath
		? `/api/images/questions/${currentImagePath.split('/').pop()}`
		: null;

	const [isPasteActive, setIsPasteActive] = useState(false);
	const [pasteSuccess, setPasteSuccess] = useState(false);

	// Create a preview URL for the selected/pasted image
	const imagePreviewUrl = useMemo(() => {
		if (image) {
			return URL.createObjectURL(image);
		}
		return null;
	}, [image]);

	// Cleanup object URL when component unmounts or image changes
	useEffect(() => {
		return () => {
			if (imagePreviewUrl) {
				URL.revokeObjectURL(imagePreviewUrl);
			}
		};
	}, [imagePreviewUrl]);

	useEffect(() => {
		const handlePaste = (event: ClipboardEvent) => {
			const clipboardItems = event.clipboardData?.items;
			if (!clipboardItems) return;

			let imageFile: File | null = null;

			for (let i = 0; i < clipboardItems.length; i++) {
				const item = clipboardItems[i];
				if (item.type.indexOf('image') !== -1 && item.kind === 'file') {
					const blob = item.getAsFile();
					if (blob) {
						const now = new Date();
						const fileName = `pasted-image-${now.getTime()}.png`;

						imageFile = new File([blob], fileName, {
							type: blob.type || 'image/png',
						});
						break;
					}
				}
			}

			if (imageFile) {
				event.preventDefault();
				setImage(imageFile);
				setIsPasteActive(false);
				setPasteSuccess(true);

				// Clear success message after 3 seconds
				setTimeout(() => setPasteSuccess(false), 3000);

				const fileInput = document.getElementById(
					'image'
				) as HTMLInputElement;
				if (fileInput) {
					fileInput.value = '';
				}

				console.log('Image pasted from clipboard:', imageFile.name);
			}
		};

		window.addEventListener('paste', handlePaste);

		return () => {
			window.removeEventListener('paste', handlePaste);
		};
	}, [setImage]);

	const handleRemoveImage = () => {
		setImage(null);
		setPasteSuccess(false);
		const fileInput = document.getElementById('image') as HTMLInputElement;
		if (fileInput) {
			fileInput.value = '';
		}
	};

	return (
		<div className="space-y-4">
			{/* Front Input */}
			<div className="space-y-2">
				<label htmlFor="front" className="font-medium text-sm">
					Question Front
				</label>
				<Textarea
					id="front"
					value={front}
					onChange={(e) => setFront(e.target.value)}
					placeholder="Enter the question here"
					rows={3}
				/>
			</div>

			{/* Back Input */}
			<div className="space-y-2">
				<label htmlFor="back" className="font-medium text-sm">
					Question Back (Answer)
				</label>
				<Textarea
					id="back"
					value={back}
					onChange={(e) => setBack(e.target.value)}
					placeholder="Enter the answer here"
					rows={3}
				/>
			</div>

			{/* Explanation Input */}
			<div className="space-y-2">
				<label htmlFor="explanation" className="font-medium text-sm">
					Explanation (Optional)
				</label>
				<Textarea
					id="explanation"
					value={explanation}
					onChange={(e) => setExplanation(e.target.value)}
					placeholder="Enter the explanation here"
					rows={5}
				/>
			</div>

			{/* Image Upload */}
			<div className="space-y-2">
				<label className="font-medium text-sm flex items-center gap-2">
					<ImageIcon className="w-4 h-4" />
					Image (Optional)
				</label>

				<div className="flex space-x-2">
					{/* File Input */}
					<Input
						id="image"
						type="file"
						accept="image/*"
						className="grow"
						onChange={(e) => {
							setImage(e.target.files?.[0] || null);
							setPasteSuccess(false);
						}}
					/>

					{/* Paste Button */}
					<Button
						variant={isPasteActive ? 'default' : 'outline'}
						type="button"
						onClick={() => {
							setIsPasteActive(true);
							setPasteSuccess(false);
							const fileInput = document.getElementById(
								'image'
							) as HTMLInputElement;
							if (fileInput) fileInput.value = '';
						}}
						onBlur={() =>
							setTimeout(() => setIsPasteActive(false), 200)
						}
						title="Click and then press Ctrl+V / Cmd+V to paste an image."
						className={`w-1/3 ${
							isPasteActive
								? 'bg-blue-600 hover:bg-blue-700 animate-pulse'
								: ''
						}`}
					>
						<ClipboardPaste className="w-4 h-4 mr-2" />
						{isPasteActive ? 'Ctrl+V Now!' : 'Paste'}
					</Button>
				</div>

				{/* Paste Active State */}
				{isPasteActive && (
					<div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
						<p className="text-sm font-semibold text-blue-600 flex items-center gap-2">
							<span className="animate-bounce">👆</span>
							Press Ctrl+V (or Cmd+V on Mac) to paste your image!
						</p>
					</div>
				)}

				{/* Success Message */}
				{pasteSuccess && (
					<div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
						<CheckCircle className="w-4 h-4 text-green-600" />
						<p className="text-sm font-semibold text-green-600">
							Image pasted successfully!
						</p>
					</div>
				)}

				{/* Image Preview */}
				{(imagePreviewUrl || currentImageUrl) && (
					<div className="relative border rounded-md p-2 bg-gray-50">
						<p className="text-xs text-gray-500 mb-2">
							{image
								? `New image: ${image.name}`
								: 'Current image:'}
						</p>
						<img
							src={imagePreviewUrl || currentImageUrl || ''}
							alt="Preview"
							className="max-h-40 rounded object-contain"
						/>
						{image && (
							<Button
								type="button"
								variant="destructive"
								size="sm"
								className="absolute top-2 right-2"
								onClick={handleRemoveImage}
							>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
