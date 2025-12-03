'use client';

import { useRouter } from 'next/navigation'; // 1. Import useRouter

import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from '@/components/ui/card';
import { LayoutGrid, Layers } from 'lucide-react';

// --- Expanded Mock Data ---
const mockdecks = [
	{
		id: 1,
		name: 'Pharmaco Basics',
		detail: 'Essential concepts in pharmacokinetics and pharmacodynamics.',
		size: 75,
		category: 'Medical',
	},
	{
		id: 2,
		name: 'React Hooks Deep Dive',
		detail: 'Understanding useState, useEffect, useContext, and custom hooks.',
		size: 42,
		category: 'Programming',
	},
	{
		id: 3,
		name: 'World Capitals',
		detail: 'A quick-fire deck to memorize the capitals of countries globally.',
		size: 195,
		category: 'Geography',
	},
	{
		id: 4,
		name: 'Organic Chemistry Reactions',
		detail: 'Key mechanisms and reagents for advanced organic synthesis.',
		size: 110,
		category: 'Science',
	},
	{
		id: 5,
		name: 'Modern Art History',
		detail: 'From Impressionism to contemporary works.',
		size: 60,
		category: 'Art',
	},
];

export default function DeckPage() {
	// 2. Initialize the router
	const router = useRouter();

	// 3. Define the click handler function
	const handleCardClick = (id: number) => {
		router.push(`/decks/${id}`);
	};

	return (
		<div className="min-h-screen p-8 bg-gray-50">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<LayoutGrid className="w-8 h-8 mr-2 text-blue-600" />
					Your Flashcard Decks ({mockdecks.length})
				</h1>
				<p className="text-gray-600">
					Select a deck to start reviewing or editing your cards.
				</p>
			</header>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{mockdecks.map((deck) => (
					<Card
						key={deck.id}
						// 4. Attach the click handler to the Card
						onClick={() => handleCardClick(deck.id)}
						className="transition-shadow duration-300 hover:shadow-lg hover:border-blue-400 cursor-pointer"
					>
						<CardHeader className="p-4 pb-2">
							<CardTitle className="text-lg font-semibold text-gray-800 truncate">
								{deck.name}
							</CardTitle>
							<CardDescription className="text-sm text-blue-600 font-medium">
								{deck.category}
							</CardDescription>
						</CardHeader>

						<CardContent className="p-4 pt-0">
							<p className="text-gray-500 text-sm line-clamp-2">
								{deck.detail}
							</p>
						</CardContent>

						<CardFooter className="flex justify-between items-center p-4 pt-2 border-t bg-gray-50 rounded-b-lg">
							<div className="flex items-center text-sm font-medium text-gray-700">
								<Layers className="w-4 h-4 mr-1 text-gray-500" />
								{deck.size} Cards
							</div>
							{/* Optional: Remove or adjust button if the whole card is clickable */}
							<button
								className="text-blue-500 hover:text-blue-700 text-sm font-medium"
								// Stop the event from propagating to the Card's onClick handler
								onClick={(e) => {
									e.stopPropagation();
									// You could add a different action here, like opening an edit modal
									handleCardClick(deck.id); // For now, it does the same thing
								}}
							>
								Questions &rarr;
							</button>
							<button
								className="text-blue-500 hover:text-blue-700 text-sm font-medium"
								// Stop the event from propagating to the Card's onClick handler
								onClick={(e) => {
									e.stopPropagation();
									// You could add a different action here, like opening an edit modal
									handleCardClick(deck.id); // For now, it does the same thing
								}}
							>
								Flashcards &rarr;
							</button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
}
