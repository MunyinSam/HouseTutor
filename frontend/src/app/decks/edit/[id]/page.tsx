'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { PencilOff, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetQuestionsByDeckId, Question } from '@/services/question.service';
import {
	QuestionCard,
	EditQuestionDialog,
	AddQuestionDialog,
} from './components';

export default function EditDeckPage() {
	const { data: session } = useSession();
	const params = useParams();
	const deckId = Number(params.id) || 0;

	// State
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
		null
	);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [addDialogOpen, setAddDialogOpen] = useState(false);

	// Fetch questions
	const { data: questions, isLoading } = useGetQuestionsByDeckId(deckId);

	// Filter questions based on search
	const filteredQuestions = (questions || []).filter(
		(q) =>
			q.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
			q.back.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Handle card click
	const handleCardClick = (question: Question) => {
		setSelectedQuestion(question);
		setEditDialogOpen(true);
	};

	// Handle edit dialog close
	const handleEditDialogClose = (open: boolean) => {
		setEditDialogOpen(open);
		if (!open) {
			setSelectedQuestion(null);
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen p-8 bg-gray-50">
				<p className="text-center text-gray-600">
					Loading questions...
				</p>
			</div>
		);
	}

	// Not authenticated
	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">
					Please sign in to edit your deck
				</p>
			</div>
		);
	}

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

			{/* Search and Add Button */}
			<div className="grid lg:grid-cols-4 gap-5 grid-cols-2 mb-5">
				<Input
					className="w-full mb-1 lg:col-span-2 col-span-1"
					placeholder="Search cards by question or answer"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black lg:col-span-1 col-span-1 mb-1"
					onClick={() => setAddDialogOpen(true)}
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Question
				</Button>
			</div>

			{/* Question Grid */}
			{filteredQuestions.length > 0 ? (
				<div className="grid lg:grid-cols-4 gap-5 sm:grid-cols-2">
					{filteredQuestions.map((question) => (
						<QuestionCard
							key={question.id}
							question={question}
							onClick={() => handleCardClick(question)}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-20">
					<p className="text-gray-600 mb-4">No questions found</p>
					<Button
						onClick={() => setAddDialogOpen(true)}
						className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Your First Question
					</Button>
				</div>
			)}

			{/* Edit Dialog */}
			<EditQuestionDialog
				open={editDialogOpen}
				onOpenChange={handleEditDialogClose}
				question={selectedQuestion}
				deckId={deckId}
			/>

			{/* Add Dialog */}
			<AddQuestionDialog
				open={addDialogOpen}
				onOpenChange={setAddDialogOpen}
				deckId={deckId}
			/>
		</div>
	);
}
