'use client';

import { useState, useEffect, use } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowRight, Layers } from 'lucide-react';

// --- TYPE DEFINITIONS ---

interface Flashcard {
	id: number;
	question: string;
	answer: string;
}

interface FullDeck {
	id: number;
	deckName: string;
	cards: Flashcard[];
}

interface DeckReviewPageProps {
	params: Promise<{
		id: string;
	}>;
	searchParams: { [key: string]: string | string[] | undefined };
}

type Grade = 'Again' | 'Good' | 'Easy';

// --- Typed Mock Data ---
const mockDeckData: FullDeck[] = [
	{
		id: 1,
		deckName: 'Pharmaco Basics',
		cards: [
			{
				id: 101,
				question:
					'What is the half-life ($t_{1/2}$) formula for first-order elimination?',
				answer: '$$t_{1/2} = 0.693 / k$$ where $k$ is the elimination rate constant.',
			},
			{
				id: 102,
				question: 'Define "Bioavailability" ($F$).',
				answer: 'The fraction of administered drug that reaches the systemic circulation.',
			},
			{
				id: 103,
				question: 'Which receptor is targeted by *Lisinopril*?',
				answer: 'Angiotensin-Converting Enzyme (ACE) to inhibit its function.',
			},
		],
	},
	{
		id: 2,
		deckName: 'React Hooks Deep Dive',
		cards: [
			{
				id: 201,
				question: 'What is the purpose of the `useEffect` hook?',
				answer: 'To perform side effects (data fetching, subscriptions, manual DOM manipulation) in functional components.',
			},
			{
				id: 202,
				question:
					"How do you prevent a component from re-rendering when props or state haven't deeply changed?",
				answer: 'Wrap the component in `React.memo`.',
			},
		],
	},
];

export default function DeckReviewPage({ params }: DeckReviewPageProps) {
	// Unwrap params Promise using React.use()
	const resolvedParams = use(params);
	const deckId: number = parseInt(resolvedParams.id);

	// --- State Initialization ---
	const [deck, setDeck] = useState<FullDeck | null>(null);
	const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [cardsToReview, setCardsToReview] = useState<Flashcard[]>([]);

	// 1. Fetch Deck Data based on ID
	useEffect(() => {
		const foundDeck: FullDeck | undefined = mockDeckData.find(
			(d) => d.id === deckId
		);
		if (foundDeck) {
			setDeck(foundDeck);
			setCardsToReview(foundDeck.cards);
		}
	}, [deckId]);

	const currentCard: Flashcard | undefined = cardsToReview[currentCardIndex];
	const cardsRemaining: number = cardsToReview.length - currentCardIndex;

	// --- Core Anki-like Logic ---
	const handleFlipCard = () => {
		setShowAnswer(true);
	};

	const handleGradeCard = (grade: Grade) => {
		if (!currentCard) return;

		console.log(`Card ID ${currentCard.id} graded as: ${grade}`);

		if (currentCardIndex < cardsToReview.length - 1) {
			setCurrentCardIndex((prev) => prev + 1);
			setShowAnswer(false);
		} else {
			alert(`Review complete for ${deck?.deckName || 'this deck'}!`);
		}
	};

	if (!deck || !currentCard) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-50">
				<p className="text-xl">
					{deck
						? `No cards found in ${deck.deckName}`
						: `Loading deck or deck ID ${deckId} not found...`}
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-start min-h-screen p-8 bg-gray-50">
			{/* Header / Deck Info */}
			<header className="w-full max-w-2xl mb-8">
				<h1 className="text-3xl font-bold text-gray-800">
					{deck.deckName} Review
				</h1>
				<div className="flex justify-between items-center text-sm text-gray-500 mt-2">
					<p className="flex items-center">
						<Layers className="w-4 h-4 mr-1" />
						Cards Remaining: **{cardsRemaining}** /{' '}
						{cardsToReview.length}
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

			{/* Central Flashcard Component */}
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
						{showAnswer ? currentCard.answer : currentCard.question}
					</CardTitle>
				</CardContent>
			</Card>

			{/* Flip/Show Answer Button */}
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

			{/* Anki Grading Buttons (Visible only after answer is shown) */}
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
