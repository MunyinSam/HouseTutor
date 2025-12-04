export interface Deck {
	id: number;
	title: string;
	description: string | null;
	category: string;
	ownerId: string;
	// Relations: User and Question are often *omitted* in nested types unless explicitly included.
	// questions?: Question[];
	// owner?: User;

	// Time stamps
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Interface for the Review model (A user's progress on a flashcard)
 * Maps to Prisma model 'Review'
 */
export interface Review {
	id: number;
	userId: string;
	flashcardId: number;

	// Spaced Repetition (SM-2) Scheduling Data
	easinessFactor: number; // default(2.5)
	interval: number; // default(0)
	consecutiveCorrect: number; // default(0)
	nextReviewDate: Date;
	lastReviewedAt: Date;

	// Relations: User and Flashcard are often *omitted* in nested types unless explicitly included.
	// user?: User;
	// flashcard?: Flashcard;
}

// --- Core User Model Interface ---

/**
 * Interface for the User model
 * Maps to Prisma model 'User'
 */
export interface User {
	id: string;
	email: string;
	name: string | null; // Based on 'String?' in Prisma schema

	// Relations to other models (Deck and Review)
	// These are arrays of the related types.
	decks: Deck[];
	reviews: Review[];
}
