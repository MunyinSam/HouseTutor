'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDeleteDeck, useGetDecksByOwnerId } from '@/services/deck.service';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	LayoutGrid,
	Layers,
	Edit,
	BookOpen,
	CreditCard,
	Image as ImageIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleSession } from '@/types';

export default function DeckPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const userId = (session as GoogleSession)?.userId;
	const { data: decks, isLoading } = useGetDecksByOwnerId(
		userId || undefined
	);

	const { mutate: deleteDeck, isSuccess: isDeleteSuccess } = useDeleteDeck();
	const [deleteOpen, setDeleteOpen] = useState(false);

	const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const selectedDeck = decks?.find((d) => d.id === selectedDeckId);

	const filteredDecks = decks?.filter((deck) =>
		deck.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleDeckClick = (id: number) => {
		setSelectedDeckId(id);
	};

	const handleEditDeck = () => {
		if (selectedDeckId) {
			router.push(`/decks/edit/${selectedDeckId}`);
		}
	};

	const handleGoToQuestions = () => {
		if (selectedDeckId) {
			router.push(`/decks/question/${selectedDeckId}`);
		}
	};

	const handleGoToFlashcards = () => {
		if (selectedDeckId) {
			router.push(`/decks/flashcard/${selectedDeckId}`);
		}
	};

	const handleGoToOcclusions = () => {
		if (selectedDeckId) {
			router.push(`/decks/occlusion/${selectedDeckId}`);
		}
	};

	const handleDeleteDeck = () => {
		if (selectedDeckId) {
			deleteDeck(selectedDeckId, {
				onSuccess: () => {
					// Now, upon success:
					setDeleteOpen(false); // 1. Close the AlertDialog
					setSelectedDeckId(null); // 2. Close the main Dialog (clearing the selection)
				},
				onError: (error) => {
					console.error('Failed to delete deck:', error);
					// Maybe just close the confirmation dialog on error,
					// leaving the main menu open for the user to try again
					setDeleteOpen(false);
				},
			});
		}
	};

	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">
					Please sign in to view your decks
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8 bg-gray-50">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<LayoutGrid className="w-8 h-8 mr-2 text-blue-600" />
					Your Decks ({filteredDecks?.length || 0})
				</h1>
				<p className="text-gray-600">
					Click on a deck to see available actions.
				</p>
			</header>

			<div className="grid grid-cols-3 gap-5">
				<Input
					className="w-full mb-5 col-span-2"
					placeholder="Search decks"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black"
					onClick={() => router.push('/decks/create')}
				>
					Add Deck
				</Button>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-20">
					<p className="text-gray-600">Loading decks...</p>
				</div>
			) : filteredDecks && filteredDecks.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredDecks.map((deck) => (
						<Card
							key={deck.id}
							onClick={() => handleDeckClick(deck.id)}
							className="transition-shadow duration-300 hover:shadow-lg hover:border-blue-400 cursor-pointer"
						>
							<CardHeader className="p-4 pb-2">
								<CardTitle className="text-lg font-semibold text-gray-800 truncate">
									{deck.title}
								</CardTitle>
								<CardDescription className="text-sm text-blue-600 font-medium">
									{deck.category}
								</CardDescription>
							</CardHeader>

							<CardContent className="p-4 pt-0">
								<p className="text-gray-500 text-sm line-clamp-2">
									{deck.description || 'No description'}
								</p>
							</CardContent>

							<CardFooter className="flex justify-between items-center p-4 pt-2 border-t bg-gray-50 rounded-b-lg">
								<div className="flex items-center text-sm font-medium text-gray-700">
									<Layers className="w-4 h-4 mr-1 text-gray-500" />
									Click to view
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-20">
					<p className="text-gray-600 mb-4">No decks found</p>
					<Button
						className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black"
						onClick={() => router.push('/decks/create')}
					>
						Create Your First Deck
					</Button>
				</div>
			)}

			{/* Dialog Menu */}
			<Dialog
				open={!!selectedDeckId}
				onOpenChange={(open) => !open && setSelectedDeckId(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{selectedDeck?.title}</DialogTitle>
						<DialogDescription>
							{selectedDeck?.description || 'No description'}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 mt-4">
						<Button
							onClick={handleEditDeck}
							variant="outline"
							className="w-full justify-start"
						>
							<Edit className="w-4 h-4 mr-2" />
							Edit Deck
						</Button>

						<Button
							onClick={handleGoToQuestions}
							variant="outline"
							className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white hover:text-gray-200"
						>
							<BookOpen className="w-4 h-4 mr-2" />
							Study Questions
						</Button>

						<Button
							onClick={handleGoToFlashcards}
							className="w-full justify-start bg-blue-600 hover:bg-blue-700"
						>
							<CreditCard className="w-4 h-4 mr-2" />
							Study Flashcards
						</Button>

						<Button
							onClick={handleGoToOcclusions}
							variant="outline"
							className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white"
						>
							<ImageIcon className="w-4 h-4 mr-2" />
							Image Occlusions
						</Button>

						<Button
							onClick={() => {
								setDeleteOpen(true);
							}}
							variant="outline"
							className="w-full justify-start bg-red-500 hover:bg-red-600 text-white"
						>
							<Edit className="w-4 h-4 mr-2" />
							Delete Deck
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						{/* Use AlertDialogTitle */}
						<AlertDialogTitle>
							Are you absolutely sure?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently
							delete the deck: **{selectedDeck?.title}**.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>

						<AlertDialogAction
							onClick={handleDeleteDeck}
							className="bg-red-500 hover:bg-red-600 text-white"
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
