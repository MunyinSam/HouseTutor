'use client';

import { useState, useEffect } from 'react';
import {
	useCreateQuestion,
	useGetQuestionById,
} from '@/services/question.service';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { PencilOff, X } from 'lucide-react'; // Added X icon for the DialogClose
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Interface for type safety
interface Question {
	id: number;
	front: string;
	back: string;
	deckId: number;
	parentId: number | null;
	subQuestions?: Question[];
}

const mockdata: Question[] = [
	{
		id: 1,
		front: 'What is the capital of France?',
		back: 'Paris',
		deckId: 1,
		parentId: null,
		subQuestions: [
			{
				id: 2,
				front: 'Which river runs through Paris?',
				back: 'The Seine',
				deckId: 1,
				parentId: 1,
			},
			{
				id: 3,
				front: 'What famous structure is in Paris?',
				back: 'Eiffel Tower',
				deckId: 1,
				parentId: 1,
			},
		],
	},
	{
		id: 4,
		front: "Explain the concept of 'Hoisting' in JavaScript.",
		back: 'Hoisting is a JavaScript mechanism where variable and function declarations are moved to the top of their containing scope during compilation.',
		deckId: 1,
		parentId: null,
		subQuestions: [
			{
				id: 5,
				front: 'What types of declarations are hoisted?',
				back: 'Function declarations and variable declarations (var).',
				deckId: 1,
				parentId: 4,
			},
		],
	},
	{
		id: 6,
		front: 'What is the formula for the area of a circle?',
		back: '$A = \\pi r^2$',
		deckId: 1,
		parentId: null,
	},
];

export default function EditDeckPage() {
	const { data: session } = useSession();
	const params = useParams();
	const { id } = params;
	const deckId = Number(id) || 0;

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCard, setSelectedCard] = useState<Question | null>(null);
	const [openDialog, setOpenDialog] = useState(false);

	const [editFront, setEditFront] = useState('');
	const [editBack, setEditBack] = useState('');

	const [openAddDialog, setOpenAddDialog] = useState(false);

	// Fetching data (using mockdata for now)
	// const { data: decks, isLoading } = useGetQuestionById(deckId);

	// Effect to update the form states when a new card is selected
	useEffect(() => {
		if (selectedCard) {
			setEditFront(selectedCard.front);
			setEditBack(selectedCard.back);
		}
	}, [selectedCard]);

	// Function to handle card click
	const handleCardClick = (card: Question) => {
		setSelectedCard(card);
		setOpenDialog(true);
	};

	// Function to handle form submission (mock update logic)
	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();

		// ** Implement your actual mutation (e.g., useUpdateQuestion) here
		console.log(
			`Updating card ${selectedCard?.id}: Front: ${editFront}, Back: ${editBack}`
		);

		// Close the dialog after submission
		setOpenDialog(false);
	};

	if (!selectedCard) {
		// Fallback card structure for the dialog when it's closed/not ready
		// You can use a generic type or simply keep it null
	}

	// Filter mockdata based on searchQuery
	const filteredCards = mockdata.filter(
		(card) =>
			card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
			card.back.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="min-h-screen p-8 bg-gray-50">
			{/* Header */}
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<PencilOff className="w-8 h-8 mr-2 text-blue-600" />
					Edit your Cards
				</h1>
				<p className="text-gray-600">
					Add or Edit your questions. Click on one to start editing.
					(Deck ID: {deckId})
				</p>
			</header>

			{/* Search Input */}
			<div className="grid grid-cols-4 gap-5">
				<Input
					className="w-full mb-5 col-span-2"
					placeholder="Search cards by question or answer"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black">
					Add Question
				</Button>
			</div>

			{/* Card Grid */}
			<div className="grid grid-cols-4 gap-5">
				{filteredCards.map((card) => (
					// Attach the click handler to open the dialog and set the card data
					<Card
						key={card.id}
						className="hover:bg-gray-100 cursor-pointer"
						onClick={() => handleCardClick(card)}
					>
						<CardHeader>
							<CardTitle className="text-xl line-clamp-2">
								{card.front}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="line-clamp-3">
								{card.back}
							</CardDescription>
							{/* Optional: Show sub-question count */}
							{card.subQuestions &&
								card.subQuestions.length > 0 && (
									<p className="text-xs text-blue-500 mt-2">
										({card.subQuestions.length}{' '}
										Sub-questions)
									</p>
								)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Edit Dialog (Rendered conditionally) */}
			{selectedCard && (
				<Dialog open={openDialog} onOpenChange={setOpenDialog}>
					<DialogContent className="sm:max-w-xl">
						<DialogHeader>
							<DialogTitle>
								Edit Card (ID: {selectedCard.id})
							</DialogTitle>
							<DialogDescription>
								Make changes to the front and back of your card
								here. Click save when you're done.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleUpdate} className="space-y-4">
							{/* Card Front Input */}
							<div className="space-y-2">
								<label
									htmlFor="front"
									className="font-medium text-sm"
								>
									Card Front (Question)
								</label>
								<Textarea
									id="front"
									value={editFront}
									onChange={(e) =>
										setEditFront(e.target.value)
									}
									placeholder="Enter the question here"
									rows={3}
								/>
							</div>

							{/* Card Back Input */}
							<div className="space-y-2">
								<label
									htmlFor="back"
									className="font-medium text-sm"
								>
									Card Back (Answer)
								</label>
								<Textarea
									id="back"
									value={editBack}
									onChange={(e) =>
										setEditBack(e.target.value)
									}
									placeholder="Enter the answer here"
									rows={5}
								/>
							</div>

							{/* Sub-Questions Information (Read-only for now) */}
							{selectedCard.subQuestions &&
								selectedCard.subQuestions.length > 0 && (
									<div className="p-3 border rounded-md bg-yellow-50 text-yellow-800">
										<p className="text-sm font-semibold">
											This card has{' '}
											{selectedCard.subQuestions.length}{' '}
											linked sub-questions.
										</p>
										<ul className="list-disc list-inside text-xs mt-1">
											{selectedCard.subQuestions.map(
												(sub) => (
													<li key={sub.id}>
														{sub.front}
													</li>
												)
											)}
										</ul>
									</div>
								)}

							{/* Dialog Footer with Buttons */}
							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</DialogClose>
								<Button type="submit">Save Changes</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
