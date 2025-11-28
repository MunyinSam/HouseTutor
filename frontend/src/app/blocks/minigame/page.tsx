'use client';

import React, { useState } from 'react';
import { useGetQuestions } from '@/services/question';
import { useGetTopics } from '@/services/topic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';

function getRandomElement<T>(arr: T[]): T | undefined {
	return arr[Math.floor(Math.random() * arr.length)];
}

const MinigamePage = () => {
	const { data: questions, isLoading: questionsLoading } = useGetQuestions();
	const { data: topics, isLoading: topicsLoading } = useGetTopics();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [userAnswer, setUserAnswer] = useState('');
	const [showDialog, setShowDialog] = useState(false);
	const [correctAnswer, setCorrectAnswer] = useState('');
	const [showResult, setShowResult] = useState(false);

	if (questionsLoading || topicsLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		);
	}

	if (!questions || questions.length === 0) {
		return (
			<div className="flex justify-center items-center h-screen">
				No questions available.
			</div>
		);
	}

	const currentQuestion = questions[currentIndex];
	const topic = topics?.find((t: any) => t.id === currentQuestion.topicId);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (
			userAnswer.trim().toLowerCase() ===
			currentQuestion.answer.trim().toLowerCase()
		) {
			setShowResult(true);
			setShowDialog(false);
			setUserAnswer('');
			setTimeout(() => {
				setShowResult(false);
				setCurrentIndex((prev) => (prev + 1) % questions.length);
			}, 1000);
		} else {
			setCorrectAnswer(currentQuestion.answer);
			setShowDialog(true);
		}
	};

	const handleNext = () => {
		setShowDialog(false);
		setUserAnswer('');
		setCurrentIndex((prev) => (prev + 1) % questions.length);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<h2 className="text-2xl font-semibold mb-2">Minigame</h2>
			<div className="mb-4 text-lg font-medium">
				Topic: {topic?.name || 'Unknown'}
			</div>
			<div className="mb-4 text-xl">{currentQuestion.question}</div>
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

export default MinigamePage;
