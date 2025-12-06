import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

// Create Question
export const createQuestion = async (
	front: string,
	back: string,
	deckId: number,
	parentId: number | null,
	imagePath: string
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        INSERT INTO questions (front, back, "deckId", "parentId", "imagePath")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

	const values = [front, back, deckId, parentId, imagePath];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Update Question
export const updateQuestion = async (
	id: number,
	front?: string,
	back?: string,
	deckId?: number,
	parentId?: number | null,
	imagePath?: string
) => {
	const pool: Pool = await getDbConnection();

	// Build dynamic update query
	const updates: string[] = [];
	const values: any[] = [];
	let paramCount = 1;

	if (front !== undefined) {
		updates.push(`front = $${paramCount++}`);
		values.push(front);
	}
	if (back !== undefined) {
		updates.push(`back = $${paramCount++}`);
		values.push(back);
	}
	if (deckId !== undefined) {
		updates.push(`"deckId" = $${paramCount++}`);
		values.push(deckId);
	}
	if (parentId !== undefined) {
		updates.push(`"parentId" = $${paramCount++}`);
		values.push(parentId);
	}
	if (imagePath !== undefined) {
		updates.push(`"imagePath" = $${paramCount++}`);
		values.push(imagePath);
	}

	if (updates.length === 0) {
		throw new Error('No fields to update');
	}

	values.push(id);
	const queryText = `
        UPDATE questions
        SET ${updates.join(', ')}, "updatedAt" = NOW()
        WHERE id = $${paramCount}
        RETURNING *;
    `;

	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Delete Question
export const deleteQuestion = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        DELETE FROM questions
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get Question by ID (with sub-questions)
export const getQuestionById = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT q.*, 
               json_agg(
                   json_build_object(
                       'id', sq.id,
                       'front', sq.front,
                       'back', sq.back,
                       'deckId', sq."deckId",
                       'parentId', sq."parentId"
                   )
               ) FILTER (WHERE sq.id IS NOT NULL) as "subQuestions"
        FROM questions q
        LEFT JOIN questions sq ON sq."parentId" = q.id
        WHERE q.id = $1
        GROUP BY q.id;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get all Questions
export const getAllQuestions = async () => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM questions
        ORDER BY id ASC;
    `;
	const result = await pool.query(queryText);
	return result.rows;
};

// Get Questions by Deck ID
export const getQuestionsByDeckId = async (deckId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT q.*, 
               json_agg(
                   json_build_object(
                       'id', sq.id,
                       'front', sq.front,
                       'back', sq.back,
                       'deckId', sq."deckId",
                       'parentId', sq."parentId"
                   )
               ) FILTER (WHERE sq.id IS NOT NULL) as "subQuestions"
        FROM questions q
        LEFT JOIN questions sq ON sq."parentId" = q.id
        WHERE q."deckId" = $1 AND q."parentId" IS NULL
        GROUP BY q.id
        ORDER BY q.id ASC;
    `;

	const values = [deckId];
	const result = await pool.query(queryText, values);
	return result.rows;
};

// Get Sub-questions by Parent ID
export const getSubQuestionsByParentId = async (parentId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM questions
        WHERE "parentId" = $1
        ORDER BY id ASC;
    `;

	const values = [parentId];
	const result = await pool.query(queryText, values);
	return result.rows;
};

export const updateQuestionPublic = async (deckId: number) => {
	const pool: Pool = await getDbConnection();

	
}
