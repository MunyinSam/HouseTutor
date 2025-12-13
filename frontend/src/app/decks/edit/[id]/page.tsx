'use client';

import { useState, useEffect } from 'react';
import {
	useCreateQuestion,
	useUpdateQuestion,
	useGetQuestionsByDeckId,
	Question,
} from '@/services/question.service';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { PencilOff, Plus, Trash2 } from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Interface for new sub-question being added
interface NewSubQuestion {
	front: string;
	back: string;
	explanation?: string;
}

export default function EditDeckPage() {
	const { data: session } = useSession();
	const params = useParams();
	const { id } = params;
	const deckId = Number(id) || 0;

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCard, setSelectedCard] = useState<Question | null>(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [openAddDialog, setOpenAddDialog] = useState(false);

	// Edit dialog state
	const [editFront, setEditFront] = useState('');
	const [editBack, setEditBack] = useState('');
	const [editImage, setEditImage] = useState<File | null>(null);
	const [editExplanation, setEditExplanation] = useState('');
	const [editedSubQuestions, setEditedSubQuestions] = useState<Question[]>(
		[]
	);
	const [newSubQuestions, setNewSubQuestions] = useState<NewSubQuestion[]>(
		[]
	);

	// Add dialog state
	const [addFront, setAddFront] = useState('');
	const [addBack, setAddBack] = useState('');
	const [addImage, setAddImage] = useState<File | null>(null);
	const [addExplanation, setAddExplanation] = useState('');
	const [addSubQuestions, setAddSubQuestions] = useState<NewSubQuestion[]>(
		[]
	);

	// Fetching data from API
	const { data: questions, isLoading } = useGetQuestionsByDeckId(deckId);
	const createQuestionMutation = useCreateQuestion();
	const updateQuestionMutation = useUpdateQuestion();

	// Effect to update the form states when a card is selected for editing
	useEffect(() => {
		if (selectedCard) {
			setEditFront(selectedCard.front);
			setEditBack(selectedCard.back);
			setEditImage(null);
			setEditExplanation(selectedCard.explanation || '');
			setEditedSubQuestions(
				selectedCard.subQuestions ? [...selectedCard.subQuestions] : []
			);
			setNewSubQuestions([]);
		}
	}, [selectedCard]);

	// Function to handle card click
	const handleCardClick = (card: Question) => {
		setSelectedCard(card);
		setOpenDialog(true);
	};

	// Handle sub-question changes for existing sub-questions
	const handleSubQuestionChange = (
		subQId: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => {
		setEditedSubQuestions((prev) =>
			prev.map((subQ) =>
				subQ.id === subQId ? { ...subQ, [field]: value } : subQ
			)
		);
	};

	// Handle new sub-question changes (in edit dialog)
	const handleNewSubQuestionChange = (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => {
		setNewSubQuestions((prev) =>
			prev.map((subQ, i) =>
				i === index ? { ...subQ, [field]: value } : subQ
			)
		);
	};

	// Add a new sub-question field to edit dialog
	const addNewSubQuestionField = () => {
		setNewSubQuestions((prev) => [...prev, { front: '', back: '', explanation: '' }]);
	};

	// Remove a new sub-question field from edit dialog
	const removeNewSubQuestionField = (index: number) => {
		setNewSubQuestions((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle add sub-question changes (in add dialog)
	const handleAddSubQuestionChange = (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => {
		setAddSubQuestions((prev) =>
			prev.map((subQ, i) =>
				i === index ? { ...subQ, [field]: value } : subQ
			)
		);
	};

	// Add a new sub-question field to add dialog
	const addSubQuestionField = () => {
		setAddSubQuestions((prev) => [...prev, { front: '', back: '', explanation: '' }]);
	};

	// Remove a sub-question field from add dialog
	const removeSubQuestionField = (index: number) => {
		setAddSubQuestions((prev) => prev.filter((_, i) => i !== index));
	};

	// Function to handle update submission
	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedCard) return;

		try {
			// Update main question
			await updateQuestionMutation.mutateAsync({
				id: selectedCard.id,
				body: {
					front: editFront,
					back: editBack,
					image: editImage,
					explanation: editExplanation,
				},
			});

			// Update existing sub-questions
			for (const subQ of editedSubQuestions) {
				await updateQuestionMutation.mutateAsync({
					id: subQ.id,
					body: {
						front: subQ.front,
						back: subQ.back,
						explanation: subQ.explanation,
					},
				});
			}

			// Create new sub-questions
			for (const newSubQ of newSubQuestions) {
				if (newSubQ.front.trim() && newSubQ.back.trim()) {
					await createQuestionMutation.mutateAsync({
						front: newSubQ.front,
						back: newSubQ.back,
						explanation: newSubQ.explanation,
						deckId: deckId,
						parentId: selectedCard.id,
					});
				}
			}

			setOpenDialog(false);
			setSelectedCard(null);
			setNewSubQuestions([]);
		} catch (error) {
			console.error('Error updating question:', error);
		}
	};

	// Function to handle add question submission
	const handleAddQuestion = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!addFront.trim() || !addBack.trim()) {
			alert('Please fill in both front and back fields');
			return;
		}

		try {
			// Create main question
			const newQuestion = await createQuestionMutation.mutateAsync({
				front: addFront,
				back: addBack,
				deckId: deckId,
				parentId: null,
				image: addImage,
				explanation: addExplanation,
			});

			// Create sub-questions if any
			for (const subQ of addSubQuestions) {
				if (subQ.front.trim() && subQ.back.trim()) {
					await createQuestionMutation.mutateAsync({
						front: subQ.front,
						back: subQ.back,
						explanation: subQ.explanation,
						deckId: deckId,
						parentId: newQuestion.id,
					});
				}
			}

			// Reset form
			setAddFront('');
			setAddBack('');
			setAddImage(null);
			setAddSubQuestions([]);
			setOpenAddDialog(false);
		} catch (error) {
			console.error('Error creating question:', error);
		}
	};

	// Filter questions based on search query
	const filteredCards = (questions || []).filter(
		(card) =>
			card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
			card.back.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="min-h-screen p-8 bg-gray-50">
				<p className="text-center text-gray-600">
					Loading questions...
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

			{/* Search Input */}
			<div className="grid lg:grid-cols-4 gap-5 grid-col-2 mb-5">
				<Input
					className="w-full mb-1 lg:col-span-2 col-span-1"
					placeholder="Search cards by question or answer"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<Button
					className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black lg:col-span-1 col-span-1 mb-1"
					onClick={() => setOpenAddDialog(true)}
				>
					<Plus className="w-4 h-4 mr-2" />
					Add Question
				</Button>
			</div>

			{/* Card Grid */}
			<div className="grid lg:grid-cols-4 gap-5 sm:grid-cols-2">
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
							{card.imagePath && (
								<img
									src={`/api/images/questions/${card.imagePath
										.split('/')
										.pop()}`}
									alt="Question preview"
									className="max-w-full h-32 object-cover rounded mb-2"
								/>
							)}
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
					<DialogContent className="sm:max-w-xl flex flex-col max-h-[90vh]">
						{' '}
						<DialogHeader>
							<DialogTitle>
								Edit Card (ID: {selectedCard.id})
							</DialogTitle>
							<DialogDescription>
								Make changes to the front and back of your card
								here. Click save when you are done.
							</DialogDescription>
						</DialogHeader>
						<form
							onSubmit={handleUpdate}
							className="space-y-4 overflow-y-auto pr-4 -mr-4"
						>
							{' '}
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
									rows={3}
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="back"
									className="font-medium text-sm"
								>
									Explanation (Optional)
								</label>
								<Textarea
									id="back"
									value={editExplanation}
									onChange={(e) =>
										setEditExplanation(e.target.value)
									}
									placeholder="Enter the explanation here"
									rows={5}
								/>
							</div>
							{/* Image Upload */}
							<div className="space-y-2">
								<label
									htmlFor="edit-image"
									className="font-medium text-sm"
								>
									Image (Optional)
								</label>
								{selectedCard.imagePath && (
									<div className="mb-2">
										<p className="text-xs text-gray-500 mb-1">
											Current image:
										</p>
										<img
											src={`/api/images/questions/${selectedCard.imagePath
												.split('/')
												.pop()}`}
											alt="Current question"
											className="max-w-xs rounded border"
										/>
									</div>
								)}
								<Input
									id="edit-image"
									type="file"
									accept="image/*"
									onChange={(e) =>
										setEditImage(
											e.target.files?.[0] || null
										)
									}
								/>
								{editImage && (
									<p className="text-xs text-green-600">
										New image selected: {editImage.name}
									</p>
								)}
							</div>
							{/* Existing Sub-Questions */}
							{editedSubQuestions.length > 0 && (
								<div className="space-y-4 border p-4 rounded-lg bg-white shadow-inner">
									<h3 className="font-bold text-lg text-blue-700">
										Existing Sub-Questions (
										{editedSubQuestions.length})
									</h3>
									{editedSubQuestions.map((subQ, index) => (
										<div
											key={subQ.id}
											className="space-y-2 border-l-4 pl-4 py-2 border-blue-200"
										>
											<p className="font-medium text-sm text-gray-700">
												Sub-Question {index + 1} (ID:{' '}
												{subQ.id})
											</p>
											<Textarea
												id={`sub-front-${subQ.id}`}
												value={subQ.front}
												onChange={(e) =>
													handleSubQuestionChange(
														subQ.id,
														'front',
														e.target.value
													)
												}
												placeholder="Sub-Question Front"
												rows={2}
												className="mt-1"
											/>
											<Textarea
												id={`sub-back-${subQ.id}`}
												value={subQ.back}
												onChange={(e) =>
													handleSubQuestionChange(
														subQ.id,
														'back',
														e.target.value
													)
												}
												placeholder="Sub-Question Back"
												rows={3}
												className="mt-1"
											/>
											<Textarea
												id={`sub-explanation-${subQ.id}`}
												value={subQ.explanation}
												onChange={(e) =>
													handleSubQuestionChange(
														subQ.id,
														'explanation',
														e.target.value
													)
												}
												placeholder="Sub-Question Explanation"
												rows={2}
												className="mt-1"
											/>
										</div>
									))}
								</div>
							)}
							{/* New Sub-Questions */}
							{newSubQuestions.length > 0 && (
								<div className="space-y-4 border p-4 rounded-lg bg-green-50 shadow-inner">
									<h3 className="font-bold text-lg text-green-700">
										New Sub-Questions (
										{newSubQuestions.length})
									</h3>
									{newSubQuestions.map((subQ, index) => (
										<div
											key={index}
											className="space-y-2 border-l-4 pl-4 py-2 border-green-300 relative"
										>
											<div className="flex justify-between items-center">
												<p className="font-medium text-sm text-gray-700">
													New Sub-Question {index + 1}
												</p>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() =>
														removeNewSubQuestionField(
															index
														)
													}
													className="text-red-500 hover:text-red-700"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
											<Textarea
												value={subQ.front}
												onChange={(e) =>
													handleNewSubQuestionChange(
														index,
														'front',
														e.target.value
													)
												}
												placeholder="Sub-Question Front"
												rows={2}
											/>
											<Textarea
												value={subQ.back}
												onChange={(e) =>
													handleNewSubQuestionChange(
														index,
														'back',
														e.target.value
													)
												}
												placeholder="Sub-Question Back"
												rows={3}
											/>
											<Textarea
												value={subQ.explanation}
												onChange={(e) =>
													handleNewSubQuestionChange(
														index,
														'explanation',
														e.target.value
													)
												}
												placeholder="Sub-Question Explanation"
												rows={3}
											/>
										</div>
									))}
								</div>
							)}
							{/* Add New Sub-Question Button */}
							<Button
								type="button"
								variant="outline"
								onClick={addNewSubQuestionField}
								className="w-full"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add New Sub-Question
							</Button>
							{/* Dialog Footer with Buttons */}
							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="outline">
										Cancel
									</Button>
								</DialogClose>
								<Button
									type="submit"
									disabled={
										updateQuestionMutation.isPending ||
										createQuestionMutation.isPending
									}
								>
									{updateQuestionMutation.isPending ||
									createQuestionMutation.isPending
										? 'Saving...'
										: 'Save Changes'}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			)}

			{/* Add Question Dialog */}
			<Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
				<DialogContent className="sm:max-w-xl flex flex-col max-h-[90vh]">
					<DialogHeader>
						<DialogTitle>Add New Question</DialogTitle>
						<DialogDescription>
							Create a new question for this deck. You can also
							add sub-questions.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={handleAddQuestion}
						className="space-y-4 overflow-y-auto pr-4 -mr-4"
					>
						{/* Question Front Input */}
						<div className="space-y-2">
							<label
								htmlFor="add-front"
								className="font-medium text-sm"
							>
								Question Front
							</label>
							<Textarea
								id="add-front"
								value={addFront}
								onChange={(e) => setAddFront(e.target.value)}
								placeholder="Enter the question here"
								rows={3}
								required
							/>
						</div>

						{/* Question Back Input */}
						<div className="space-y-2">
							<label
								htmlFor="add-back"
								className="font-medium text-sm"
							>
								Question Back (Answer)
							</label>
							<Textarea
								id="add-back"
								value={addBack}
								onChange={(e) => setAddBack(e.target.value)}
								placeholder="Enter the answer here"
								rows={3}
								required
							/>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="add-explanation"
								className="font-medium text-sm"
							>
								Explanation (Optional)
							</label>
							<Textarea
								id="add-back"
								value={addExplanation}
								onChange={(e) =>
									setAddExplanation(e.target.value)
								}
								placeholder="Enter the explanation here"
								rows={5}
							/>
						</div>

						{/* Image Upload */}
						<div className="space-y-2">
							<label
								htmlFor="add-image"
								className="font-medium text-sm"
							>
								Image (Optional)
							</label>
							<Input
								id="add-image"
								type="file"
								accept="image/*"
								onChange={(e) =>
									setAddImage(e.target.files?.[0] || null)
								}
							/>
							{addImage && (
								<p className="text-xs text-green-600">
									Image selected: {addImage.name}
								</p>
							)}
						</div>

						{/* Sub-Questions */}
						{addSubQuestions.length > 0 && (
							<div className="space-y-4 border p-4 rounded-lg bg-blue-50 shadow-inner">
								<h3 className="font-bold text-lg text-blue-700">
									Sub-Questions ({addSubQuestions.length})
								</h3>
								{addSubQuestions.map((subQ, index) => (
									<div
										key={index}
										className="space-y-2 border-l-4 pl-4 py-2 border-blue-300 relative"
									>
										<div className="flex justify-between items-center">
											<p className="font-medium text-sm text-gray-700">
												Sub-Question {index + 1}
											</p>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() =>
													removeSubQuestionField(
														index
													)
												}
												className="text-red-500 hover:text-red-700"
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
										<Textarea
											value={subQ.front}
											onChange={(e) =>
												handleAddSubQuestionChange(
													index,
													'front',
													e.target.value
												)
											}
											placeholder="Sub-Question Front"
											rows={2}
										/>
										<Textarea
											value={subQ.back}
											onChange={(e) =>
												handleAddSubQuestionChange(
													index,
													'back',
													e.target.value
												)
											}
											placeholder="Sub-Question Back"
											rows={3}
										/>
									</div>
								))}
							</div>
						)}

						{/* Add Sub-Question Button */}
						<Button
							type="button"
							variant="outline"
							onClick={addSubQuestionField}
							className="w-full"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Sub-Question
						</Button>

						{/* Dialog Footer */}
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button
								type="submit"
								disabled={createQuestionMutation.isPending}
							>
								{createQuestionMutation.isPending
									? 'Creating...'
									: 'Create Question'}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
