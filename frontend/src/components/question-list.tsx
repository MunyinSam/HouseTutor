// components/QuestionList.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	useIncrementQuestionPriority,
	useDecrementQuestionPriority,
} from '@/services/question';

// Define the type for a Question
type Question = {
	id: number;
	question: string;
	answer: string;
	topicId: number;
	priority: number;
};

// Define the props for the QuestionList component
type QuestionListProps = {
	question: Question;
	onPriorityChange?: (id: number, newPriority: number) => void;
	hideAnswer?: boolean;
	onAnswered?: (id: number, isCorrect: boolean) => void;
};

const QuestionList = ({
	question,
	onPriorityChange,
	hideAnswer,
	onAnswered,
}: QuestionListProps) => {
	const [userAnswer, setUserAnswer] = useState('');
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

	const incrementPriorityMutation = useIncrementQuestionPriority();
	const decrementPriorityMutation = useDecrementQuestionPriority();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const correct =
			userAnswer.trim().toLowerCase() ===
			question.answer.trim().toLowerCase();

		setIsCorrect(correct);
		if (onAnswered) {
			onAnswered(question.id, correct);
		}

		// Optionally, reset the input after submission
		// setUserAnswer('');
	};

	const handleIncrement = () => {
		incrementPriorityMutation.mutate(question.id, {
			onSuccess: (data) => {
				onPriorityChange?.(question.id, data.priority);
			},
		});
	};

	const handleDecrement = () => {
		decrementPriorityMutation.mutate(question.id, {
			onSuccess: (data) => {
				onPriorityChange?.(question.id, data.priority);
			},
		});
	};

	// Determine the border color based on the answer state
	let inputBorderColor = 'border-gray-300';
	if (isCorrect === true) {
		inputBorderColor = 'border-green-500';
	} else if (isCorrect === false) {
		inputBorderColor = 'border-red-500';
	}

	return (
		<div className="border p-4 rounded-lg shadow-md mb-6 bg-white">
			<div className="flex justify-between items-start mb-3">
				<div className="text-lg font-semibold pr-4">
					{question.question}
				</div>
				<span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground whitespace-nowrap">
					Priority:{' '}
					<span className="font-bold">{question.priority}</span>
				</span>
			</div>

			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<Input
					value={userAnswer}
					onChange={(e) => setUserAnswer(e.target.value)}
					placeholder="Your answer..."
					required
					className={inputBorderColor}
				/>
				<div className="flex justify-between items-center gap-2">
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleIncrement}
							disabled={incrementPriorityMutation.isPending}
						>
							+ Priority
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDecrement}
							disabled={decrementPriorityMutation.isPending}
						>
							- Priority
						</Button>
					</div>
					<Button type="submit" size="sm" className="w-1/4">
						Check
					</Button>
				</div>
			</form>

			{isCorrect === false && !hideAnswer && (
				<div className="mt-3 text-sm font-bold text-red-600">
					❌ Incorrect. The answer is: **{question.answer}**
				</div>
			)}
			{isCorrect === false && hideAnswer && (
				<div className="mt-3 text-sm font-bold text-red-600">
					❌ Incorrect.
				</div>
			)}
		</div>
	);
};

export default QuestionList;
