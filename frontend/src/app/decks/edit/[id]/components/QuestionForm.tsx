'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QuestionFormProps } from './types';

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
				<label htmlFor="image" className="font-medium text-sm">
					Image (Optional)
				</label>
				{currentImageUrl && (
					<div className="mb-2">
						<p className="text-xs text-gray-500 mb-1">
							Current image:
						</p>
						<img
							src={currentImageUrl}
							alt="Current question"
							className="max-w-xs rounded border"
						/>
					</div>
				)}
				<Input
					id="image"
					type="file"
					accept="image/*"
					onChange={(e) => setImage(e.target.files?.[0] || null)}
				/>
				{image && (
					<p className="text-xs text-green-600">
						{currentImagePath ? 'New image' : 'Image'} selected:{' '}
						{image.name}
					</p>
				)}
			</div>
		</div>
	);
}
