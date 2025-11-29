import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

// Create Question
export const createQuestion = async (
	question: string,
	answer: string,
	topicId: number
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        INSERT INTO questions (question, answer, "topicId")
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

	const values = [question, answer, topicId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Update Question
export const updateQuestion = async (
	id: string,
	question: string,
	answer: string,
	topicId: number
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        UPDATE questions
        SET 
            question = $2, 
            answer = $3, 
            "topicId" = $4, 
            "updatedAt" = current_timestamp
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id, question, answer, topicId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Delete Question
export const deleteQuestion = async (id: string) => {
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

// Get Question by ID
export const getQuestionById = async (id: string) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM questions
        WHERE id = $1;
    `;

	const values = [id];

	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get All Questions
export const getAllQuestions = async () => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM questions
        ORDER BY priority DESC, "createdAt" DESC;
    `;
	const result = await pool.query(queryText);
	return result.rows;
};

// Get Questions by Multiple Topic IDs
export const getQuestionsByTopicIds = async (topicIds: number[]) => {
	if (!topicIds.length) return [];

	const pool: Pool = await getDbConnection();
	const params = topicIds.map((_, i) => `$${i + 1}`).join(',');
	const values = topicIds;

	const queryText = `
        SELECT * FROM questions
        WHERE "topicId" IN (${params})
        ORDER BY priority DESC, "createdAt" DESC;
    `;

	const result = await pool.query(queryText, values);

	return result.rows;
};

// Increment Priority
export const incrementPriority = async (id: number) => {
	const pool: Pool = await getDbConnection();

	const queryText = `
        UPDATE questions
        SET 
            priority = priority + 1, 
            "updatedAt" = current_timestamp
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];

	const result = await pool.query(queryText, values);

	return result.rows[0];
};

// Decrement Priority
export const decrementPriority = async (id: number) => {
	const pool: Pool = await getDbConnection();

	const queryText = `
        UPDATE questions
        SET 
            priority = priority - 1, 
            "updatedAt" = current_timestamp
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];

	const result = await pool.query(queryText, values);

	return result.rows[0];
};
