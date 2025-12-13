'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { QuestionCardProps } from './types';

export function QuestionCard({ question, onClick }: QuestionCardProps) {
	const imageUrl = question.imagePath
		? `/api/images/questions/${question.imagePath.split('/').pop()}`
		: null;

	return (
		<Card
			className="hover:bg-gray-100 cursor-pointer transition-colors"
			onClick={onClick}
		>
			<CardHeader>
				<CardTitle className="text-xl line-clamp-2">
					{question.front}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{imageUrl && (
					<img
						src={imageUrl}
						alt="Question preview"
						className="max-w-full h-32 object-cover rounded mb-2"
					/>
				)}
				<CardDescription className="line-clamp-3">
					{question.back}
				</CardDescription>
				{question.subQuestions && question.subQuestions.length > 0 && (
					<p className="text-xs text-blue-500 mt-2">
						({question.subQuestions.length} Sub-questions)
					</p>
				)}
			</CardContent>
		</Card>
	);
}
