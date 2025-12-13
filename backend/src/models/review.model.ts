import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

// Create Review
export const createReview = async (
	userId: string,
	flashcardId: number,
	easinessFactor: number = 2.5,
	interval: number = 0,
	consecutiveCorrect: number = 0,
	nextReviewDate: Date = new Date()
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        INSERT INTO reviews (
            "userId", 
            "flashcardId", 
            "easinessFactor", 
            "interval", 
            "consecutiveCorrect", 
            "nextReviewDate",
            "lastReviewedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT ("userId", "flashcardId") 
        DO UPDATE SET
            "easinessFactor" = EXCLUDED."easinessFactor",
            "interval" = EXCLUDED."interval",
            "consecutiveCorrect" = EXCLUDED."consecutiveCorrect",
            "nextReviewDate" = EXCLUDED."nextReviewDate",
            "lastReviewedAt" = NOW()
        RETURNING *;
    `;

	const values = [
		userId,
		flashcardId,
		easinessFactor,
		interval,
		consecutiveCorrect,
		nextReviewDate,
	];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Update Review (for SM-2 algorithm updates)
export const updateReview = async (
	id: number,
	easinessFactor?: number,
	interval?: number,
	consecutiveCorrect?: number,
	nextReviewDate?: Date
) => {
	const pool: Pool = await getDbConnection();

	// Build dynamic update query
	const updates: string[] = ['"lastReviewedAt" = NOW()'];
	const values: unknown[] = [];
	let paramCount = 1;

	if (easinessFactor !== undefined) {
		updates.push(`"easinessFactor" = $${paramCount++}`);
		values.push(easinessFactor);
	}
	if (interval !== undefined) {
		updates.push(`"interval" = $${paramCount++}`);
		values.push(interval);
	}
	if (consecutiveCorrect !== undefined) {
		updates.push(`"consecutiveCorrect" = $${paramCount++}`);
		values.push(consecutiveCorrect);
	}
	if (nextReviewDate !== undefined) {
		updates.push(`"nextReviewDate" = $${paramCount++}`);
		values.push(nextReviewDate);
	}

	values.push(id);
	const queryText = `
        UPDATE reviews
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *;
    `;

	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Delete Review
export const deleteReview = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        DELETE FROM reviews
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get Review by ID
export const getReviewById = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM reviews
        WHERE id = $1;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get Review by User ID and Flashcard ID
export const getReviewByUserAndFlashcard = async (
	userId: string,
	flashcardId: number
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM reviews
        WHERE "userId" = $1 AND "flashcardId" = $2;
    `;

	const values = [userId, flashcardId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get all Reviews for a User
export const getReviewsByUserId = async (userId: string) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT r.*, 
               json_build_object(
                   'id', f.id,
                   'questionId', f."questionId"
               ) as flashcard
        FROM reviews r
        INNER JOIN flashcards f ON r."flashcardId" = f.id
        WHERE r."userId" = $1
        ORDER BY r."nextReviewDate" ASC;
    `;

	const values = [userId];
	const result = await pool.query(queryText, values);
	return result.rows;
};

// Get all Reviews for a Flashcard
export const getReviewsByFlashcardId = async (flashcardId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM reviews
        WHERE "flashcardId" = $1
        ORDER BY "lastReviewedAt" DESC;
    `;

	const values = [flashcardId];
	const result = await pool.query(queryText, values);
	return result.rows;
};

// Get Reviews due for review (nextReviewDate <= now)
export const getDueReviews = async (userId: string) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT r.*, 
               json_build_object(
                   'id', f.id,
                   'questionId', f."questionId",
                   'question', json_build_object(
                       'id', q.id,
                       'front', q.front,
                       'back', q.back,
                       'deckId', q."deckId"
                   )
               ) as flashcard
        FROM reviews r
        INNER JOIN flashcards f ON r."flashcardId" = f.id
        INNER JOIN questions q ON f."questionId" = q.id
        WHERE r."userId" = $1 AND r."nextReviewDate" <= NOW()
        ORDER BY r."nextReviewDate" ASC;
    `;

	const values = [userId];
	const result = await pool.query(queryText, values);
	return result.rows;
};
