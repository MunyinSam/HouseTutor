import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

// Create Flashcard
export const createFlashcard = async (questionId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        INSERT INTO flashcards ("questionId")
        VALUES ($1)
        RETURNING *;
    `;

	const values = [questionId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Delete Flashcard
export const deleteFlashcard = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        DELETE FROM flashcards
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get Flashcard by ID
export const getFlashcardById = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT f.*, 
               json_build_object(
                   'id', q.id,
                   'front', q.front,
                   'back', q.back,
                   'deckId', q."deckId",
                   'parentId', q."parentId"
               ) as question
        FROM flashcards f
        INNER JOIN questions q ON f."questionId" = q.id
        WHERE f.id = $1;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get Flashcard by Question ID
export const getFlashcardByQuestionId = async (questionId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT f.*, 
               json_build_object(
                   'id', q.id,
                   'front', q.front,
                   'back', q.back,
                   'deckId', q."deckId",
                   'parentId', q."parentId"
               ) as question
        FROM flashcards f
        INNER JOIN questions q ON f."questionId" = q.id
        WHERE f."questionId" = $1;
    `;

	const values = [questionId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get all Flashcards
export const getAllFlashcards = async () => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT f.*, 
               json_build_object(
                   'id', q.id,
                   'front', q.front,
                   'back', q.back,
                   'deckId', q."deckId",
                   'parentId', q."parentId"
               ) as question
        FROM flashcards f
        INNER JOIN questions q ON f."questionId" = q.id
        ORDER BY f.id ASC;
    `;
	const result = await pool.query(queryText);
	return result.rows;
};
