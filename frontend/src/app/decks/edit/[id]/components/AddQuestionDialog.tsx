'use client';

import { useState } from 'react';
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
import { useCreateQuestion } from '@/services/question.service';
import { QuestionForm } from './QuestionForm';
import { SubQuestionList } from './SubQuestionList';
import { AddQuestionDialogProps, SubQuestionInput } from './types';

export function AddQuestionDialog({
	open,
	onOpenChange,
	deckId,
}: AddQuestionDialogProps) {
	// Form state
	const [front, setFront] = useState('');
	const [back, setBack] = useState('');
	const [explanation, setExplanation] = useState('');
	const [image, setImage] = useState<File | null>(null);
	const [subQuestions, setSubQuestions] = useState<SubQuestionInput[]>([]);

	// Mutation
	const createMutation = useCreateQuestion();

	// Reset form
	const resetForm = () => {
		setFront('');
		setBack('');
		setExplanation('');
		setImage(null);
		setSubQuestions([]);
	};

	// Handle sub-question changes
	const handleSubQuestionChange = (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => {
		setSubQuestions((prev) =>
			prev.map((sq, i) => (i === index ? { ...sq, [field]: value } : sq))
		);
	};

	// Add new sub-question
	const handleAddSubQuestion = () => {
		setSubQuestions((prev) => [
			...prev,
			{ front: '', back: '', explanation: '' },
		]);
	};

	// Remove sub-question
	const handleRemoveSubQuestion = (index: number) => {
		setSubQuestions((prev) => prev.filter((_, i) => i !== index));
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!front.trim() || !back.trim()) {
			alert('Please fill in both front and back fields');
			return;
		}

		try {
			// Create main question
			const newQuestion = await createMutation.mutateAsync({
				front,
				back,
				explanation,
				deckId,
				parentId: null,
				image,
			});

			// Create sub-questions
			for (const sq of subQuestions) {
				if (sq.front.trim() && sq.back.trim()) {
					await createMutation.mutateAsync({
						front: sq.front,
						back: sq.back,
						explanation: sq.explanation,
						deckId,
						parentId: newQuestion.id,
					});
				}
			}

			resetForm();
			onOpenChange(false);
		} catch (error) {
			console.error('Error creating question:', error);
		}
	};

	// Handle dialog close
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			resetForm();
		}
		onOpenChange(newOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-xl flex flex-col max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>Add New Question</DialogTitle>
					<DialogDescription>
						Create a new question for this deck. You can also add
						sub-questions.
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
					/>

					<SubQuestionList
						existingSubQuestions={[]}
						newSubQuestions={subQuestions}
						onExistingChange={() => {}}
						onNewChange={handleSubQuestionChange}
						onAddNew={handleAddSubQuestion}
						onRemoveNew={handleRemoveSubQuestion}
					/>

					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								Cancel
							</Button>
						</DialogClose>
						<Button
							type="submit"
							disabled={createMutation.isPending}
						>
							{createMutation.isPending
								? 'Creating...'
								: 'Create Question'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
