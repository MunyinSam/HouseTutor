'use client';

import { useState, useEffect } from 'react';
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
	useCreateQuestion,
	useUpdateQuestion,
	useDeleteQuestion,
} from '@/services/question.service';
import { QuestionForm } from './QuestionForm';
import { SubQuestionList } from './SubQuestionList';
import { EditQuestionDialogProps, SubQuestionInput } from './types';
import { Trash2 } from 'lucide-react';

export function EditQuestionDialog({
	open,
	onOpenChange,
	question,
	deckId,
}: EditQuestionDialogProps) {
	// Form state
	const [front, setFront] = useState('');
	const [back, setBack] = useState('');
	const [explanation, setExplanation] = useState('');
	const [image, setImage] = useState<File | null>(null);
	const [existingSubQuestions, setExistingSubQuestions] = useState<
		SubQuestionInput[]
	>([]);
	const [newSubQuestions, setNewSubQuestions] = useState<SubQuestionInput[]>(
		[]
	);

	// Mutations
	const updateMutation = useUpdateQuestion();
	const createMutation = useCreateQuestion();
	const deleteMutation = useDeleteQuestion();

	// Delete confirmation state
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Reset form when question changes
	useEffect(() => {
		if (question) {
			setFront(question.front);
			setBack(question.back);
			setExplanation(question.explanation || '');
			setImage(null);
			setExistingSubQuestions(
				question.subQuestions?.map((sq) => ({
					id: sq.id,
					front: sq.front,
					back: sq.back,
					explanation: sq.explanation || '',
				})) || []
			);
			setNewSubQuestions([]);
			setShowDeleteConfirm(false);
		}
	}, [question]);

	// Handle existing sub-question changes
	const handleExistingChange = (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => {
		setExistingSubQuestions((prev) =>
			prev.map((sq, i) => (i === index ? { ...sq, [field]: value } : sq))
		);
	};

	// Handle new sub-question changes
	const handleNewChange = (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => {
		setNewSubQuestions((prev) =>
			prev.map((sq, i) => (i === index ? { ...sq, [field]: value } : sq))
		);
	};

	// Add new sub-question
	const handleAddNew = () => {
		setNewSubQuestions((prev) => [
			...prev,
			{ front: '', back: '', explanation: '' },
		]);
	};

	// Remove new sub-question
	const handleRemoveNew = (index: number) => {
		setNewSubQuestions((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!question) return;

		try {
			// Update main question
			await updateMutation.mutateAsync({
				id: question.id,
				body: {
					front,
					back,
					explanation,
					image,
				},
			});

			// Update existing sub-questions
			for (const sq of existingSubQuestions) {
				if (sq.id) {
					await updateMutation.mutateAsync({
						id: sq.id,
						body: {
							front: sq.front,
							back: sq.back,
							explanation: sq.explanation,
						},
					});
				}
			}

			// Create new sub-questions
			for (const sq of newSubQuestions) {
				if (sq.front.trim() && sq.back.trim()) {
					await createMutation.mutateAsync({
						front: sq.front,
						back: sq.back,
						explanation: sq.explanation,
						deckId,
						parentId: question.id,
					});
				}
			}

			onOpenChange(false);
		} catch (error) {
			console.error('Error updating question:', error);
		}
	};

	// Handle delete
	const handleDelete = async () => {
		if (!question) return;
		try {
			await deleteMutation.mutateAsync(question.id);
			onOpenChange(false);
		} catch (error) {
			console.error('Error deleting question:', error);
		}
	};

	const isLoading =
		updateMutation.isPending ||
		createMutation.isPending ||
		deleteMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl flex flex-col max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>
						Edit Card {question && `(ID: ${question.id})`}
					</DialogTitle>
					<DialogDescription>
						Make changes to the front and back of your card here.
						Click save when you are done.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4 overflow-y-auto pr-4 -mr-4"
				>
					<QuestionForm
						front={front}
						setFront={setFront}
						back={back}
						setBack={setBack}
						explanation={explanation}
						setExplanation={setExplanation}
						image={image}
						setImage={setImage}
						currentImagePath={question?.imagePath}
					/>

					<SubQuestionList
						existingSubQuestions={existingSubQuestions}
						newSubQuestions={newSubQuestions}
						onExistingChange={handleExistingChange}
						onNewChange={handleNewChange}
						onAddNew={handleAddNew}
						onRemoveNew={handleRemoveNew}
					/>

					<DialogFooter className="flex flex-row justify-between sm:justify-between">
						<div>
							{!showDeleteConfirm ? (
								<Button
									type="button"
									variant="destructive"
									onClick={() => setShowDeleteConfirm(true)}
									disabled={isLoading}
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete
								</Button>
							) : (
								<div className="flex gap-2">
									<Button
										type="button"
										variant="destructive"
										onClick={handleDelete}
										disabled={isLoading}
									>
										{deleteMutation.isPending
											? 'Deleting...'
											: 'Confirm Delete'}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											setShowDeleteConfirm(false)
										}
										disabled={isLoading}
									>
										Cancel
									</Button>
								</div>
							)}
						</div>
						<div className="flex gap-2">
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Cancel
								</Button>
							</DialogClose>
							<Button type="submit" disabled={isLoading}>
								{isLoading ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
