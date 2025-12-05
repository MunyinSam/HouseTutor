'use client';

import { useState, useCallback } from 'react';
import {
	MessageCircleQuestionMark,
	Check,
	X,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useGetQuestionsByDeckId, Question } from '@/services/question.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

// --- Type Definitions ---
interface QuestionAnswer {
	questionId: number;
	userAnswer: string;
	isCorrect: boolean | null;
	isSubmitted: boolean;
}

// --- Component ---
export default function QuestionPage() {
	const params = useParams();
	const { id } = params;
	const deckId = Number(id) || 0;

	const router = useRouter();

	const { data: questions, isLoading } = useGetQuestionsByDeckId(deckId);
	const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});
	const [showAllAnswers, setShowAllAnswers] = useState(false);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

	// Handler to track user input changes
	const handleAnswerChange = (questionId: number, value: string) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: {
				questionId,
				userAnswer: value,
				// Preserve previous submission state if it exists
				isCorrect: prev[questionId]?.isCorrect ?? null,
				isSubmitted: prev[questionId]?.isSubmitted ?? false,
			},
		}));
	};

	// Handler to check the answer against the correct 'back' value
	const handleSubmitAnswer = useCallback(
		(questionId: number, correctAnswer: string) => {
			const userAnswer = answers[questionId]?.userAnswer || '';

			// Simple string comparison for correctness (can be expanded for better tolerance)
			const isCorrect =
				userAnswer.trim().toLowerCase() ===
				correctAnswer.trim().toLowerCase();

			setAnswers((prev) => ({
				...prev,
				[questionId]: {
					...prev[questionId],
					isCorrect: isCorrect,
					isSubmitted: true,
				},
			}));
		},
		[answers]
	);

	// --- Loading State ---
	if (isLoading) {
		return (
			<div className="min-h-screen p-8 bg-gray-50">
				<p className="text-center text-gray-600">
					Loading questions...
				</p>
			</div>
		);
	}

	// --- Main Render ---
	return (
		<div className="min-h-screen p-8 bg-gray-50">
			{/* The corrected header section */}{' '}
			<Button
				variant="ghost"
				onClick={() => router.back()}
				className="mb-4"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back to Decks
			</Button>
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<MessageCircleQuestionMark className="w-8 h-8 mr-2 text-blue-600" />
					Questions
				</h1>
				<p className="text-gray-600">
					Answer these questions (Deck ID: {deckId})
				</p>
				{questions && (
					<p className="text-sm text-gray-500 mt-1">
						Question {currentQuestionIndex + 1} of{' '}
						{questions.length}
					</p>
				)}

				{/* Show Answers Checkbox */}
				<div className="flex items-center space-x-2 mt-4">
					<Checkbox
						id="showAnswers"
						checked={showAllAnswers}
						onCheckedChange={(checked: boolean) =>
							setShowAllAnswers(checked as boolean)
						}
					/>
					<label
						htmlFor="showAnswers"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Show correct answers for wrong answers
					</label>
				</div>
			</header>
			{/* --- */}
			{/* Current Question Display */}
			<div className="space-y-6">
				{questions && questions.length > 0 ? (
					(() => {
						const question = questions[currentQuestionIndex];
						const mainAnswer = answers[question.id];
						const showMainAnswer =
							showAllAnswers &&
							mainAnswer?.isSubmitted &&
							mainAnswer?.isCorrect === false;

						return (
							<div key={question.id} className="space-y-4">
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
										<CardTitle className="text-xl flex items-center gap-2">
											{/* <span className="text-blue-600 font-bold">
												Q{question.id}:
											</span> */}
											{question.front}
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										{/* Answer Input */}
										<div className="flex gap-2">
											<Input
												placeholder="Type your answer..."
												value={
													mainAnswer?.userAnswer || ''
												}
												onChange={(e) =>
													handleAnswerChange(
														question.id,
														e.target.value
													)
												}
												disabled={
													mainAnswer?.isSubmitted
												}
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
													handleSubmitAnswer(
														question.id,
														question.back
													)
												}
												disabled={
													!mainAnswer?.userAnswer ||
													mainAnswer?.isSubmitted
												}
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

										{/* Show Correct Answer if wrong and checkbox is checked */}
										{showMainAnswer && (
											<div className="bg-green-50 border border-green-200 rounded-lg p-3">
												<p className="text-xs font-semibold text-green-700 mb-1">
													Correct Answer:
												</p>
												<p className="text-gray-800 text-sm">
													{question.back}
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Sub-questions if any */}
								{question.subQuestions &&
									question.subQuestions.length > 0 && (
										<div className="ml-8 space-y-3">
											{question.subQuestions.map(
												(subQuestion) => {
													const subAnswer =
														answers[subQuestion.id];
													const showSubAnswer =
														showAllAnswers &&
														subAnswer?.isSubmitted &&
														subAnswer?.isCorrect ===
															false;

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
																<CardTitle className="text-lg flex items-center gap-2">
																	{/* <span className="text-purple-600 font-bold">
																		Q
																		{
																			question.id
																		}
																		.
																		{
																			subQuestion.id
																		}
																		:
																	</span> */}
																	{
																		subQuestion.front
																	}
																</CardTitle>
															</CardHeader>
															<CardContent className="space-y-3">
																{/* Answer Input */}
																<div className="flex gap-2">
																	<Input
																		placeholder="Type your answer..."
																		value={
																			subAnswer?.userAnswer ||
																			''
																		}
																		onChange={(
																			e
																		) =>
																			handleAnswerChange(
																				subQuestion.id,
																				e
																					.target
																					.value
																			)
																		}
																		disabled={
																			subAnswer?.isSubmitted
																		}
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
																			handleSubmitAnswer(
																				subQuestion.id,
																				subQuestion.back
																			)
																		}
																		disabled={
																			!subAnswer?.userAnswer ||
																			subAnswer?.isSubmitted
																		}
																		size="sm"
																	>
																		Check
																	</Button>
																</div>

																{/* Result Indicator */}
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

																{/* Show Correct Answer if wrong and checkbox is checked */}
																{showSubAnswer && (
																	<div className="bg-green-50 border border-green-200 rounded-lg p-3">
																		<p className="text-xs font-semibold text-green-700 mb-1">
																			Correct
																			Answer:
																		</p>
																		<p className="text-gray-800 text-sm">
																			{
																				subQuestion.back
																			}
																		</p>
																	</div>
																)}
															</CardContent>
														</Card>
													);
												}
											)}
										</div>
									)}
							</div>
						);
					})()
				) : (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">
							No questions found in this deck.
						</p>
						<p className="text-gray-400 text-sm mt-2">
							Add some questions to get started!
						</p>
					</div>
				)}
			</div>
			{/* Navigation Buttons */}
			{questions && questions.length > 0 && (
				<div className="flex justify-between items-center mt-8">
					<Button
						variant="outline"
						onClick={() =>
							setCurrentQuestionIndex((prev) =>
								Math.max(0, prev - 1)
							)
						}
						disabled={currentQuestionIndex === 0}
					>
						<ChevronLeft className="w-4 h-4 mr-2" />
						Previous
					</Button>

					<div className="text-sm text-gray-600">
						Question {currentQuestionIndex + 1} of{' '}
						{questions.length}
					</div>

					<Button
						variant="outline"
						onClick={() =>
							setCurrentQuestionIndex((prev) =>
								Math.min(questions.length - 1, prev + 1)
							)
						}
						disabled={currentQuestionIndex === questions.length - 1}
					>
						Next
						<ChevronRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			)}
		</div>
	);
}
