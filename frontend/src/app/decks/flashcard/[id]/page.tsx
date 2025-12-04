'use client';

import { useState, use } from 'react';
import { useGetDeckById } from '@/services/deck.service';
import { useGetQuestionsByDeckId } from '@/services/question.service';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowRight, Layers, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeckReviewPageProps {
	params: Promise<{
		id: string;
	}>;
}

type Grade = 'Again' | 'Good' | 'Easy';

export default function DeckReviewPage({ params }: DeckReviewPageProps) {
	const router = useRouter();
	const resolvedParams = use(params);
	const deckId: number = parseInt(resolvedParams.id);

	const { data: deck, isLoading: deckLoading } = useGetDeckById(deckId);
	const { data: questions, isLoading: questionsLoading } =
		useGetQuestionsByDeckId(deckId);

	const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);

	const currentCard = questions?.[currentCardIndex];
	const cardsRemaining = (questions?.length || 0) - currentCardIndex;

	const handleFlipCard = () => {
		setShowAnswer(true);
	};

	const handleGradeCard = (grade: Grade) => {
		if (!currentCard) return;

		console.log(`Card ID ${currentCard.id} graded as: ${grade}`);

		if (questions && currentCardIndex < questions.length - 1) {
			setCurrentCardIndex((prev) => prev + 1);
			setShowAnswer(false);
		} else {
			alert(`Review complete for ${deck?.title || 'this deck'}!`);
			setCurrentCardIndex(0);
			setShowAnswer(false);
		}
	};

	if (deckLoading || questionsLoading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-50">
				<p className="text-xl">Loading deck...</p>
			</div>
		);
	}

	if (!deck || !questions || questions.length === 0) {
		return (
			<div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 gap-4">
				<p className="text-xl">
					{deck
						? `No questions found in ${deck.title}`
						: `Deck not found`}
				</p>
				<Button onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-50">
			<header className="w-full max-w-2xl mb-8">
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back to Decks
				</Button>

				<h1 className="text-3xl font-bold text-gray-800">
					{deck.title} Review
				</h1>
				<div className="flex justify-between items-center text-sm text-gray-500 mt-2">
					<p className="flex items-center">
						<Layers className="w-4 h-4 mr-1" />
						Cards Remaining: {cardsRemaining} / {questions.length}
					</p>
					<button
						className="text-blue-600 hover:text-blue-800 flex items-center"
						onClick={() => {
							setCurrentCardIndex(0);
							setShowAnswer(false);
						}}
					>
						Reset Session <RotateCcw className="w-4 h-4 ml-1" />
					</button>
				</div>
			</header>

			<Card
				onClick={!showAnswer ? handleFlipCard : undefined}
				className={`w-full max-w-2xl min-h-[300px] shadow-2xl transition-all duration-500 transform ${
					showAnswer
						? 'bg-white'
						: 'bg-blue-100 hover:shadow-blue-300'
				} cursor-pointer`}
			>
				<CardHeader className="text-center pt-8">
					<CardDescription className="text-lg font-medium text-gray-600">
						{showAnswer ? 'Answer' : 'Question'}
					</CardDescription>
				</CardHeader>

				<CardContent className="p-8 text-center flex justify-center items-center min-h-[150px]">
					<CardTitle className="text-3xl font-extrabold text-gray-900 leading-relaxed">
						{showAnswer ? currentCard?.back : currentCard?.front}
					</CardTitle>
				</CardContent>
			</Card>

			{!showAnswer && (
				<div className="w-full max-w-2xl mt-8">
					<Button
						onClick={handleFlipCard}
						className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
					>
						Show Answer
					</Button>
				</div>
			)}

			{showAnswer && (
				<div className="w-full max-w-2xl mt-8 grid grid-cols-3 gap-4">
					<Button
						onClick={() => handleGradeCard('Again')}
						className="py-6 bg-red-600 hover:bg-red-700 text-lg"
					>
						Again (1m)
					</Button>
					<Button
						onClick={() => handleGradeCard('Good')}
						className="py-6 bg-yellow-600 hover:bg-yellow-700 text-lg"
					>
						Good (10m)
					</Button>
					<Button
						onClick={() => handleGradeCard('Easy')}
						className="py-6 bg-green-600 hover:bg-green-700 text-lg"
					>
						Easy (4d) <ArrowRight className="w-5 h-5 ml-2" />
					</Button>
				</div>
			)}
		</div>
	);
}
