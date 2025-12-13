'use client';

import { useState, useCallback, useMemo } from 'react';
import {
	MessageCircleQuestionMark,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetQuestionsByDeckId } from '@/services/question.service';
import { useGetImageOcclusionsByDeckId } from '@/services/imageOcclusion.service';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	QuestionAnswer,
	StudyItem,
	shuffleArray,
	OcclusionStudyCard,
	QuestionStudyCard,
} from './components';

// --- Main Component ---
export default function QuestionPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();

	const deckId = Number(params.id) || 0;
	const includeOcclusions = searchParams.get('occlusions') === 'true';

	// Fetch data
	const { data: questions, isLoading: questionsLoading } =
		useGetQuestionsByDeckId(deckId);
	const { data: occlusions, isLoading: occlusionsLoading } =
		useGetImageOcclusionsByDeckId(includeOcclusions ? deckId : 0);

	// State
	const [answers, setAnswers] = useState<Record<number, QuestionAnswer>>({});
	const [showAllAnswers, setShowAllAnswers] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	// Create shuffled study items
	const studyItems = useMemo(() => {
		const items: StudyItem[] = [];

		// Add questions
		if (questions) {
			questions.forEach((q) => items.push({ type: 'question', data: q }));
		}

		// Add occlusions if enabled
		if (includeOcclusions && occlusions) {
			occlusions.forEach((o) =>
				items.push({ type: 'occlusion', data: o })
			);
		}

		// Shuffle
		return shuffleArray(items);
	}, [questions, occlusions, includeOcclusions]);

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
	const isLoading =
		questionsLoading || (includeOcclusions && occlusionsLoading);

	if (isLoading) {
		return (
			<div className="min-h-screen p-8 bg-gray-50">
				<p className="text-center text-gray-600">Loading...</p>
			</div>
		);
	}

	const currentItem = studyItems[currentIndex];

	// --- Main Render ---
	return (
		<div className="min-h-screen p-8 bg-gray-50">
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
					Study Session
				</h1>
				<p className="text-gray-600">
					Answer questions and reveal occlusions (Deck ID: {deckId})
				</p>
				{studyItems.length > 0 && (
					<p className="text-sm text-gray-500 mt-1">
						Item {currentIndex + 1} of {studyItems.length}
						{includeOcclusions &&
							occlusions &&
							occlusions.length > 0 && (
								<span className="ml-2 text-purple-600">
									({occlusions.length} occlusions included)
								</span>
							)}
					</p>
				)}

				{/* Show Answers Checkbox */}
				<div className="flex items-center space-x-2 mt-4">
					<Checkbox
						id="showAnswers"
						checked={showAllAnswers}
						onCheckedChange={(checked) =>
							setShowAllAnswers(checked as boolean)
						}
					/>
					<label
						htmlFor="showAnswers"
						className="text-sm font-medium leading-none cursor-pointer"
					>
						Show correct answers / Reveal all occlusions
					</label>
				</div>
			</header>

			{/* Current Item Display */}
			<div className="space-y-6 px-10">
				{studyItems.length > 0 && currentItem ? (
					currentItem.type === 'question' ? (
						<QuestionStudyCard
							question={currentItem.data}
							answers={answers}
							showAllAnswers={showAllAnswers}
							onAnswerChange={handleAnswerChange}
							onSubmitAnswer={handleSubmitAnswer}
						/>
					) : (
						<OcclusionStudyCard
							occlusion={currentItem.data}
							showAllAnswers={showAllAnswers}
						/>
					)
				) : (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">
							No items found in this deck.
						</p>
						<p className="text-gray-400 text-sm mt-2">
							Add some questions or image occlusions to get
							started!
						</p>
					</div>
				)}
			</div>

			{/* Navigation Buttons */}
			{studyItems.length > 0 && (
				<div className="flex justify-between items-center mt-8">
					<Button
						variant="outline"
						onClick={() =>
							setCurrentIndex((prev) => Math.max(0, prev - 1))
						}
						disabled={currentIndex === 0}
					>
						<ChevronLeft className="w-4 h-4 mr-2" />
						Previous
					</Button>

					<div className="text-sm text-gray-600">
						{currentItem?.type === 'question' ? (
							<span className="text-blue-600">Question</span>
						) : (
							<span className="text-purple-600">Occlusion</span>
						)}{' '}
						{currentIndex + 1} of {studyItems.length}
					</div>

					<Button
						variant="outline"
						onClick={() =>
							setCurrentIndex((prev) =>
								Math.min(studyItems.length - 1, prev + 1)
							)
						}
						disabled={currentIndex === studyItems.length - 1}
					>
						Next
						<ChevronRight className="w-4 h-4 ml-2" />
					</Button>
				</div>
			)}
		</div>
	);
}
