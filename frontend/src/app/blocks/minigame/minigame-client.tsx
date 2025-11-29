'use client';

import React, { useState, useEffect } from 'react';
import { useGetTopics } from '@/services/topic';
import {
	useGetQuestionsByTopicId,
	useIncrementQuestionPriority,
	useDecrementQuestionPriority,
} from '@/services/question';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Question = {
	id: number;
	question: string;
	answer: string;
	topicId: number;
	priority: number;
};
type Topic = { id: number; name: string; description?: string };

const MinigameClient = () => {
	const { data: topics, isLoading: topicsLoading } = useGetTopics();
	const searchParams = useSearchParams();
	const router = useRouter();

	// --- Accessing Search Params inside the Client Component ---
	const topicIdParam = searchParams.get('topicId');
	const topicIds = topicIdParam
		? topicIdParam.split(',').filter(Boolean)
		: [];

	const { data: questionsByTopic, isLoading: questionsLoading } =
		useGetQuestionsByTopicId(
			topicIds.length === 1 ? topicIds[0] : topicIds
		);

	const questions: Question[] = (questionsByTopic || []) as Question[];

	const [currentIndex, setCurrentIndex] = useState(0);
	const [userAnswer, setUserAnswer] = useState('');
	const [showDialog, setShowDialog] = useState(false);
	const [correctAnswer, setCorrectAnswer] = useState('');
	const [showResult, setShowResult] = useState(false);
	const [completed, setCompleted] = useState(false);
	// Track wrong attempts per question by id
	const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>(
		{}
	);
	// Track the current question list order
	const [questionOrder, setQuestionOrder] = useState<number[]>([]);
	// Show a UI for first wrong answer
	const [showFirstWrong, setShowFirstWrong] = useState(false);

	const incrementPriorityMutation = useIncrementQuestionPriority();
	const decrementPriorityMutation = useDecrementQuestionPriority();

	useEffect(() => {
		if (!topicIdParam || topicIds.length === 0) {
			// Ensure router.push happens only client-side
			router.push('/blocks');
		}
	}, [router, topicIdParam, topicIds]);

	// Reset state when questions change
	useEffect(() => {
		setCurrentIndex(0);
		setWrongAttempts({});
		setQuestionOrder(questions.map((_: unknown, idx: number) => idx));
		setCompleted(false);
	}, [topicIdParam, questionsByTopic]);

	// Conditional rendering based on initial checks
	if (!topicIdParam || topicIds.length === 0) {
		// Since we are inside the Client Component, this handles the check
		return null;
	}

	if (topicsLoading || questionsLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		);
	}

	if (!topics || topics.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				No topics available.
			</div>
		);
	}

	if (!questions || questions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-6">
				<h2 className="text-2xl font-semibold mb-2">
					No questions for this topic.
				</h2>
				<Button onClick={() => router.push('/blocks')}>
					Choose another topic
				</Button>
			</div>
		);
	}

	// Use questionOrder to determine which question to show
	const hasQuestions =
		questions.length > 0 &&
		questionOrder.length > 0 &&
		typeof questionOrder[currentIndex] !== 'undefined';
	const currentQuestion = hasQuestions
		? questions[questionOrder[currentIndex]]
		: null;
	const topic =
		currentQuestion && topics
			? topics.find((t: Topic) => t.id === currentQuestion.topicId)
			: null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentQuestion) return;

		const qid = String(currentQuestion.id);
		const isCorrect =
			userAnswer.trim().toLowerCase() ===
			currentQuestion.answer.trim().toLowerCase();

		if (isCorrect) {
			setShowResult(true);
			setShowFirstWrong(false);
			setTimeout(() => {
				setShowResult(false);
				setUserAnswer('');
				if (currentIndex === questionOrder.length - 1) {
					setCompleted(true);
				} else {
					setCurrentIndex((prev) => prev + 1);
				}
			}, 1000);
		} else {
			const attempts = wrongAttempts[qid] || 0;
			if (attempts === 0) {
				// First wrong: move question to back, show first wrong UI
				setWrongAttempts((prev) => ({ ...prev, [qid]: 1 }));
				setShowFirstWrong(true);
				setTimeout(() => {
					setShowFirstWrong(false);
					// Move question to back
					setQuestionOrder((prevOrder) => {
						const newOrder = [...prevOrder];
						const [removed] = newOrder.splice(currentIndex, 1);
						newOrder.push(removed);
						return newOrder;
					});
					// Don't advance index if last question, else stay at same index
					if (currentIndex >= questionOrder.length - 1) {
						setCurrentIndex(0);
					}
					setUserAnswer('');
				}, 1200);
			} else {
				// Second wrong: show dialog with correct answer
				setCorrectAnswer(currentQuestion.answer);
				setShowDialog(true);
				setWrongAttempts((prev) => ({ ...prev, [qid]: 0 }));
			}
		}
	};

	const handleNext = () => {
		setShowDialog(false);
		setUserAnswer('');
		if (currentIndex === questionOrder.length - 1) {
			setCompleted(true);
		} else {
			setCurrentIndex((prev) => prev + 1);
		}
	};

	if (completed) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-6">
				<h2 className="text-2xl font-semibold mb-2">
					Congratulations!
				</h2>
				<div className="mb-4 text-lg font-medium">
					You&apos;ve completed all questions.
				</div>
				<Button onClick={() => router.push('/blocks')}>
					Back to Blocks
				</Button>
			</div>
		);
	}

	if (!currentQuestion) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<h2 className="text-2xl font-semibold mb-2">Minigame</h2>
			<div className="text-lg font-medium">
				Topic: {topic?.name || 'Unknown'}
			</div>
			<div className="text-sm">{topic?.description}</div>
			<div className="mb-4 w-full max-w-xs">
				<div className="flex justify-end">
					<span className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
						Priority:{' '}
						<span className="font-bold">
							{currentQuestion.priority}
						</span>
					</span>
				</div>
				<div className="mb-4 text-xl text-center">
					{currentQuestion.question}
				</div>
			</div>
			<div className="flex gap-2 mb-2">
				<Button
					variant="outline"
					onClick={() =>
						incrementPriorityMutation.mutate(currentQuestion.id)
					}
					disabled={incrementPriorityMutation.isPending}
				>
					+ Priority
				</Button>
				<Button
					variant="outline"
					onClick={() =>
						decrementPriorityMutation.mutate(currentQuestion.id)
					}
					disabled={decrementPriorityMutation.isPending}
				>
					- Priority
				</Button>
			</div>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-4 w-full max-w-xs"
			>
				<Input
					value={userAnswer}
					onChange={(e) => setUserAnswer(e.target.value)}
					placeholder="Your answer..."
					required
				/>
				<Button type="submit">Submit</Button>
			</form>
			{showResult && (
				<div className="text-green-600 font-bold">Correct!</div>
			)}
			{showFirstWrong && (
				<div className="text-red-600 font-bold">
					Wrong answer! Try again when it comes back.
				</div>
			)}
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent>
					<DialogTitle>Incorrect!</DialogTitle>
					<DialogDescription>
						The correct answer was:{' '}
						<span className="font-bold">{correctAnswer}</span>
					</DialogDescription>
					<DialogFooter>
						<Button onClick={handleNext}>Next Question</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MinigameClient;
