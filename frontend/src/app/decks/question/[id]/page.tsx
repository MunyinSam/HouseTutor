'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
	MessageCircleQuestionMark,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useGetQuestionsByDeckId, Question } from '@/services/question.service';
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
	const [showAllAnswers, setShowAllAnswers] = useState(true);
	const [currentIndex, setCurrentIndex] = useState(0);
	const cardRef = useRef<HTMLDivElement>(null);

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

	// Handler for question deletion - move to next item or adjust index
	const handleDelete = useCallback(() => {
		// If we're at the last item, go back one
		if (currentIndex >= studyItems.length - 1 && currentIndex > 0) {
			setCurrentIndex(currentIndex - 1);
		}
		// The query will refetch and update studyItems automatically
	}, [currentIndex, studyItems.length]);

	// Helper to get all question IDs that need answering for current item
	const getCurrentQuestionIds = useCallback((): {
		id: number;
		back: string;
	}[] => {
		const currentItem = studyItems[currentIndex];
		if (!currentItem || currentItem.type !== 'question') return [];

		const question = currentItem.data as Question;
		const ids = [{ id: question.id, back: question.back }];

		// Add sub-questions
		if (question.subQuestions) {
			question.subQuestions.forEach((sq) => {
				ids.push({ id: sq.id, back: sq.back });
			});
		}

		return ids;
	}, [studyItems, currentIndex]);

	// Check if all questions in current item are submitted
	const areAllSubmitted = useCallback(() => {
		const questionIds = getCurrentQuestionIds();
		return (
			questionIds.length > 0 &&
			questionIds.every((q) => answers[q.id]?.isSubmitted)
		);
	}, [getCurrentQuestionIds, answers]);

	// Get next unsubmitted question ID
	const getNextUnsubmittedId = useCallback((): {
		id: number;
		back: string;
	} | null => {
		const questionIds = getCurrentQuestionIds();
		return questionIds.find((q) => !answers[q.id]?.isSubmitted) || null;
	}, [getCurrentQuestionIds, answers]);

	// Global Enter key handler
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			// 1. Check if the key is relevant
			const isNavigationKey =
				e.key === 'ArrowRight' || e.key === 'ArrowLeft';
			const isActionKey = e.key === 'Enter';

			if (!isNavigationKey && !isActionKey) {
				return;
			}

			// 2. Prevent interference with active input/text areas
			const activeElement = document.activeElement;
			if (
				activeElement?.tagName === 'INPUT' ||
				activeElement?.tagName === 'TEXTAREA'
			) {
				// We don't interfere if the user is actively typing.
				// NOTE: If Enter is pressed while typing, it will usually trigger form submission/new line in a textarea.
				return;
			}

			// Prevent default browser action for the handled keys
			e.preventDefault();

			const currentItem = studyItems[currentIndex];
			if (!currentItem) return;

			// --- Navigation (ArrowLeft/ArrowRight) ---
			if (e.key === 'ArrowRight') {
				if (currentIndex < studyItems.length - 1) {
					setCurrentIndex((prev) => prev + 1);
				}
				return;
			} else if (e.key === 'ArrowLeft') {
				if (currentIndex > 0) {
					setCurrentIndex((prev) => prev - 1);
				}
				return;
			}

			// --- Submission/Next (Enter) ---
			if (e.key === 'Enter') {
				// Occlusions: Just go to the next item
				if (currentItem.type === 'occlusion') {
					if (currentIndex < studyItems.length - 1) {
						setCurrentIndex((prev) => prev + 1);
					}
					return;
				}

				// Questions: Determine action based on submission status
				if (areAllSubmitted()) {
					// All answered, go to the next item
					if (currentIndex < studyItems.length - 1) {
						setCurrentIndex((prev) => prev + 1);
					}
				} else {
					const next = getNextUnsubmittedId();
					if (next) {
						handleSubmitAnswer(next.id, next.back);
					}
				}
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => window.removeEventListener('keydown', handleGlobalKeyDown);
	}, [
		studyItems,
		currentIndex,
		areAllSubmitted,
		getNextUnsubmittedId,
		handleSubmitAnswer,
	]);

	// Scroll to card when index changes
	useEffect(() => {
		cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [currentIndex]);

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
						Show correct answers
					</label>
				</div>
			</header>

			{/* Current Item Display */}
			<div ref={cardRef} className="space-y-6 px-10">
				{studyItems.length > 0 && currentItem ? (
					currentItem.type === 'question' ? (
						<QuestionStudyCard
							question={currentItem.data}
							answers={answers}
							showAllAnswers={showAllAnswers}
							onAnswerChange={handleAnswerChange}
							onSubmitAnswer={handleSubmitAnswer}
							onDelete={handleDelete}
						/>
					) : (
						<OcclusionStudyCard
							occlusion={currentItem.data}
							showAllAnswers={false}
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
