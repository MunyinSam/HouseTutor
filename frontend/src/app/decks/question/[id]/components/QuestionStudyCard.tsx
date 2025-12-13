'use client';

import { Check, X, Trash2 } from 'lucide-react';
import { Question, useDeleteQuestion } from '@/services/question.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuestionAnswer } from './types';

interface QuestionStudyCardProps {
	question: Question;
	answers: Record<number, QuestionAnswer>;
	showAllAnswers: boolean;
	onAnswerChange: (questionId: number, value: string) => void;
	onSubmitAnswer: (questionId: number, correctAnswer: string) => void;
	onDelete?: (questionId: number) => void;
}

export function QuestionStudyCard({
	question,
	answers,
	showAllAnswers,
	onAnswerChange,
	onSubmitAnswer,
	onDelete,
}: QuestionStudyCardProps) {
	const deleteMutation = useDeleteQuestion();
	const mainAnswer = answers[question.id];

	const handleDelete = async () => {
		if (confirm('Are you sure you want to delete this question?')) {
			await deleteMutation.mutateAsync(question.id);
			onDelete?.(question.id);
		}
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		questionId: number,
		correctAnswer: string
	) => {
		if (e.key === 'Enter' && !mainAnswer?.isSubmitted) {
			e.preventDefault();
			onSubmitAnswer(questionId, correctAnswer);
		}
	};
	const showMainAnswer =
		showAllAnswers &&
		mainAnswer?.isSubmitted &&
		mainAnswer?.isCorrect === false;

	return (
		<div className="space-y-4">
			{/* Main Question Card */}
			<Card
				className={`border-l-4 ${
					mainAnswer?.isSubmitted
						? mainAnswer.isCorrect
							? 'border-l-green-500 bg-green-50/30'
							: 'border-l-red-500 bg-red-50/30'
						: 'border-l-blue-500'
				}`}
			>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl flex items-center gap-2">
							{question.front}
						</CardTitle>
						<Button
							variant="ghost"
							size="icon"
							className="text-red-500 hover:text-red-700 hover:bg-red-50"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{/* Display image if exists */}
					{question.imagePath && (
						<div className="mb-4 max-w-150">
							<img
								src={`/api/images/questions/${question.imagePath
									.split('/')
									.pop()}`}
								alt="Question"
								className="max-w-full rounded border shadow-sm"
							/>
						</div>
					)}

					{/* Answer Input */}
					<div className="grid col-span-3 gap-2">
						<Input
							placeholder="Type your answer... (press Enter to check)"
							value={mainAnswer?.userAnswer || ''}
							onChange={(e) =>
								onAnswerChange(question.id, e.target.value)
							}
							onKeyDown={(e) =>
								handleKeyDown(e, question.id, question.back)
							}
							disabled={mainAnswer?.isSubmitted}
							className={
								mainAnswer?.isSubmitted
									? mainAnswer.isCorrect
										? 'border-green-500 bg-green-50'
										: 'border-red-500 bg-red-50'
									: ''
							}
						/>
						<Button
							onClick={() =>
								onSubmitAnswer(question.id, question.back)
							}
							disabled={mainAnswer?.isSubmitted}
						>
							Check
						</Button>
					</div>

					{/* Result Indicator */}
					{mainAnswer?.isSubmitted && (
						<div
							className={`flex items-center gap-2 p-2 rounded ${
								mainAnswer.isCorrect
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800'
							}`}
						>
							{mainAnswer.isCorrect ? (
								<>
									<Check className="w-5 h-5" />
									<span className="font-semibold">
										Correct!
									</span>
								</>
							) : (
								<>
									<X className="w-5 h-5" />
									<span className="font-semibold">
										Incorrect
									</span>
								</>
							)}
						</div>
					)}

					{/* Show Correct Answer if wrong */}
					{showMainAnswer && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-3">
							<p className="text-xs font-semibold text-green-700 mb-1">
								Correct Answer:
							</p>
							<p className="text-gray-800 text-sm">
								{question.back}
							</p>
							{question.explanation && (
								<div>
									<p className="mt-2 text-xs font-semibold text-green-700 mb-1">
										Explanation:
									</p>
									<p className="text-gray-800 text-sm">
										{question.explanation}
									</p>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Sub-questions */}
			{question.subQuestions && question.subQuestions.length > 0 && (
				<SubQuestionList
					subQuestions={question.subQuestions}
					answers={answers}
					showAllAnswers={showAllAnswers}
					onAnswerChange={onAnswerChange}
					onSubmitAnswer={onSubmitAnswer}
				/>
			)}
		</div>
	);
}

// Sub-question list component
function SubQuestionList({
	subQuestions,
	answers,
	showAllAnswers,
	onAnswerChange,
	onSubmitAnswer,
}: {
	subQuestions: Question['subQuestions'];
	answers: Record<number, QuestionAnswer>;
	showAllAnswers: boolean;
	onAnswerChange: (questionId: number, value: string) => void;
	onSubmitAnswer: (questionId: number, correctAnswer: string) => void;
}) {
	if (!subQuestions || subQuestions.length === 0) return null;

	return (
		<div className="ml-8 space-y-3">
			{subQuestions.map((subQuestion) => {
				const subAnswer = answers[subQuestion.id];
				const showSubAnswer =
					showAllAnswers &&
					subAnswer?.isSubmitted &&
					subAnswer?.isCorrect === false;

				return (
					<Card
						key={subQuestion.id}
						className={`border-l-4 ${
							subAnswer?.isSubmitted
								? subAnswer.isCorrect
									? 'border-l-green-500 bg-green-50/30'
									: 'border-l-red-500 bg-red-50/30'
								: 'border-l-purple-400 bg-purple-50/30'
						}`}
					>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">
								{subQuestion.front}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{subQuestion.imagePath && (
								<div className="mb-4">
									<img
										src={`/api/images/questions/${subQuestion.imagePath
											.split('/')
											.pop()}`}
										alt="Sub-question"
										className="max-w-md rounded border shadow-sm"
									/>
								</div>
							)}

							<div className="grid col-span-3 gap-2">
								<Input
									placeholder="Type your answer... (press Enter to check)"
									value={subAnswer?.userAnswer || ''}
									onChange={(e) =>
										onAnswerChange(
											subQuestion.id,
											e.target.value
										)
									}
									onKeyDown={(e) => {
										if (
											e.key === 'Enter' &&
											!subAnswer?.isSubmitted
										) {
											e.preventDefault();
											onSubmitAnswer(
												subQuestion.id,
												subQuestion.back
											);
										}
									}}
									disabled={subAnswer?.isSubmitted}
									className={
										subAnswer?.isSubmitted
											? subAnswer.isCorrect
												? 'border-green-500 bg-green-50'
												: 'border-red-500 bg-red-50'
											: ''
									}
								/>
								<Button
									onClick={() =>
										onSubmitAnswer(
											subQuestion.id,
											subQuestion.back
										)
									}
									disabled={subAnswer?.isSubmitted}
									size="sm"
								>
									Check
								</Button>
							</div>

							{subAnswer?.isSubmitted && (
								<div
									className={`flex items-center gap-2 p-2 rounded text-sm ${
										subAnswer.isCorrect
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'
									}`}
								>
									{subAnswer.isCorrect ? (
										<>
											<Check className="w-4 h-4" />
											<span className="font-semibold">
												Correct!
											</span>
										</>
									) : (
										<>
											<X className="w-4 h-4" />
											<span className="font-semibold">
												Incorrect
											</span>
										</>
									)}
								</div>
							)}

							{showSubAnswer && (
								<div className="bg-green-50 border border-green-200 rounded-lg p-3">
									<p className="text-xs font-semibold text-green-700 mb-1">
										Correct Answer:
									</p>
									<p className="text-gray-800 text-sm">
										{subQuestion.back}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
