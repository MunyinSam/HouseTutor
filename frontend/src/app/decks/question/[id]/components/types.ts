import { Question } from '@/services/question.service';
import { ImageOcclusion } from '@/services/imageOcclusion.service';

export interface QuestionAnswer {
	questionId: number;
	userAnswer: string;
	isCorrect: boolean | null;
	isSubmitted: boolean;
}

// Unified study item type - discriminated union
export type StudyItem =
	| { type: 'question'; data: Question }
	| { type: 'occlusion'; data: ImageOcclusion };

// Shuffle array utility
export function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
