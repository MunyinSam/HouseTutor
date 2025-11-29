import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

// Create Topic
export const createTopic = async (
	name: string,
	description: string | null = null
) => {
	const pool: Pool = await getDbConnection();

	const queryText = `
        INSERT INTO topics (name, description)
        VALUES ($1, $2)
        RETURNING *;
    `;

	// Values map to $1 and $2
	const values = [name, description];

	const result = await pool.query(queryText, values);

	return result.rows[0];
};

// Update Topic
export const updateTopic = async (
	id: string,
	name: string,
	description: string | null = null
) => {
	const pool: Pool = await getDbConnection();

	const queryText = `
        UPDATE topics
        SET 
            name = $2, 
            description = $3, 
            "updatedAt" = current_timestamp
        WHERE id = $1
        RETURNING *;
    `;

	// Values map to $1 (id), $2 (name), $3 (description)
	const values = [id, name, description];

	const result = await pool.query(queryText, values);

	return result.rows[0];
};

// Delete Topic
export const deleteTopic = async (id: string) => {
	const pool: Pool = await getDbConnection();

	// PostgreSQL Query:
	// - Uses positional parameter $1 instead of @id
	// - Uses RETURNING * instead of OUTPUT DELETED.*
	const queryText = `
        DELETE FROM topics
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];

	const result = await pool.query(queryText, values);

	return result.rows[0];
};

// Get Topic by ID
export const getTopicById = async (id: string) => {
	const pool: Pool = await getDbConnection();

	// PostgreSQL Query:
	// - Uses positional parameter $1 instead of @id
	const queryText = `
        SELECT * FROM topics
        WHERE id = $1;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get All Topics
export const getAllTopics = async () => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM topics
        ORDER BY "createdAt" DESC;
    `;

	const result = await pool.query(queryText);
	return result.rows;
};
