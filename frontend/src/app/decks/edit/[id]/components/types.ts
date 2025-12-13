import { Question } from '@/services/question.service';

// For new sub-questions being added (no id yet)
export interface SubQuestionInput {
	id?: number;
	front: string;
	back: string;
	explanation?: string;
	isNew?: boolean; // Flag to distinguish new vs existing
}

// Props for QuestionForm
export interface QuestionFormProps {
	front: string;
	setFront: (value: string) => void;
	back: string;
	setBack: (value: string) => void;
	explanation: string;
	setExplanation: (value: string) => void;
	image: File | null;
	setImage: (file: File | null) => void;
	currentImagePath?: string | null;
}

// Props for QuestionCard
export interface QuestionCardProps {
	question: Question;
	onClick: () => void;
}

// Props for SubQuestionForm
export interface SubQuestionFormProps {
	subQuestion: SubQuestionInput;
	index: number;
	onChange: (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => void;
	onRemove?: (index: number) => void;
	showRemoveButton?: boolean;
	label: string;
}

// Props for SubQuestionList
export interface SubQuestionListProps {
	existingSubQuestions: SubQuestionInput[];
	newSubQuestions: SubQuestionInput[];
	onExistingChange: (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => void;
	onNewChange: (
		index: number,
		field: 'front' | 'back' | 'explanation',
		value: string
	) => void;
	onAddNew: () => void;
	onRemoveNew: (index: number) => void;
}

// Props for EditQuestionDialog
export interface EditQuestionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	question: Question | null;
	deckId: number;
}

// Props for AddQuestionDialog
export interface AddQuestionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	deckId: number;
}
