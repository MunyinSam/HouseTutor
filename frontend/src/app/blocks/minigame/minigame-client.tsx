// app/MinigameClient.tsx (or wherever your original file is)
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useGetTopics } from '@/services/topic';
import { useGetQuestionsByTopicId } from '@/services/question';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// Import the new QuestionList component
import QuestionList from '@/components/question-list';

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

	const topicIdParam = searchParams.get('topicId');
	const topicIds = topicIdParam
		? topicIdParam.split(',').filter(Boolean)
		: [];
	const singleTopicId = topicIds.length > 0 ? topicIds[0] : undefined;

	const { data: fetchedQuestions, isLoading: questionsLoading } =
		useGetQuestionsByTopicId(topicIds || []);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [hideAnswer, setHideAnswer] = useState(false);
	const [correctMap, setCorrectMap] = useState<{ [id: number]: boolean }>({});

	const currentTopic = useMemo(() => {
		if (!topics || !singleTopicId) return null;
		return topics.find((t: Topic) => String(t.id) === singleTopicId);
	}, [topics, singleTopicId]);

	const handlePriorityChange = (id: number, newPriority: number) => {
		setQuestions((prev) =>
			prev.map((q) => (q.id === id ? { ...q, priority: newPriority } : q))
		);
	};

	// Track correct answers
	const handleAnswered = (id: number, isCorrect: boolean) => {
		setCorrectMap((prev) => ({ ...prev, [id]: isCorrect }));
	};

	// --- Redirect if no topic is selected ---
	useEffect(() => {
		if (!topicIdParam || topicIds.length === 0) {
			router.push('/blocks');
		}
	}, [router, topicIdParam, topicIds]);

	useEffect(() => {
		setQuestions(fetchedQuestions);
	}, [fetchedQuestions]);

	// --- Loading States ---
	if (!topicIdParam || topicIds.length === 0) {
		return null; // Will redirect shortly
	}

	if (topicsLoading || questionsLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		);
	}

	if (!questions || questions.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-6">
				<h2 className="text-2xl font-semibold mb-2">
					No questions for the selected topic.
				</h2>
				<Button onClick={() => router.push('/blocks')}>
					Choose another topic
				</Button>
			</div>
		);
	}

	// Calculate correct count
	const correctCount = Object.values(correctMap).filter(Boolean).length;
	const totalCount = questions.length;

	return (
		<div className="flex flex-col items-center min-h-screen pt-10 pb-20 px-4 sm:px-6 lg:px-8">
			<h2 className="text-3xl font-bold mb-2">Minigame: All Questions</h2>
			<div className="mb-2 text-base font-medium">
				Topics:&nbsp;
				{topics && topicIds.length > 0
					? topicIds
							.map(
								(id) =>
									topics.find(
										(t: Topic) => String(t.id) === id
									)?.name || 'Unknown'
							)
							.join(', ')
					: 'None'}
			</div>
			<div className="text-md text-gray-500 mb-8">
				{currentTopic?.description}
			</div>

			<div className="flex items-center gap-2 mb-2">
				<input
					type="checkbox"
					checked={hideAnswer}
					onChange={() => setHideAnswer((prev) => !prev)}
				/>
				<label className="text-sm">Don't show answer</label>
			</div>

			<div className="w-full max-w-2xl">
				{/* Map over the entire list of questions */}
				{questions.map((question) => (
					<QuestionList
						key={question.id}
						question={question}
						onPriorityChange={handlePriorityChange}
						hideAnswer={hideAnswer}
						onAnswered={handleAnswered}
					/>
				))}
			</div>

			<div className="mb-4 text-lg font-semibold">
				Score: {correctCount} / {totalCount}
			</div>

			<div className="mt-10">
				<Button onClick={() => router.push('/blocks')}>
					Back to Topics
				</Button>
			</div>
		</div>
	);
};

export default MinigameClient;
