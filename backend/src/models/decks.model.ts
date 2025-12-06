import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

// Create Deck
export const createDeck = async (
	title: string,
	description: string | null,
	category: string,
	ownerId: string
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        INSERT INTO decks (title, description, category, "ownerId")
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;

	const values = [title, description, category, ownerId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Update Deck
export const updateDeck = async (
	id: number,
	title: string,
	description: string | null,
	category: string
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        UPDATE decks
        SET 
            title = $2, 
            description = $3, 
            category = $4, 
            "updatedAt" = current_timestamp
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id, title, description, category];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Delete Deck
export const deleteDeck = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        DELETE FROM decks
        WHERE id = $1
        RETURNING *;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get Deck by ID
export const getDeckById = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM decks
        WHERE id = $1;
    `;

	const values = [id];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Get All Decks
export const getAllDecks = async () => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM decks
        ORDER BY "createdAt" DESC;
    `;
	const result = await pool.query(queryText);
	return result.rows;
};

// Get Decks by Owner ID
export const getDecksByOwnerId = async (ownerId: string) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM decks
        WHERE "ownerId" = $1
        ORDER BY "createdAt" DESC;
    `;

	const values = [ownerId];
	const result = await pool.query(queryText, values);
	return result.rows;
};

// Get Decks by Category
export const getDecksByCategory = async (category: string) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM decks
        WHERE category = $1
        ORDER BY "createdAt" DESC;
    `;

	const values = [category];
	const result = await pool.query(queryText, values);
	return result.rows;
};

export const updateDeckPublic = async (deckId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        UPDATE FROM decks
		SET public = true
        WHERE id = $1
        RETURNING *;
    `;

	const values = [deckId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

export const updateDeckPrivate = async (deckId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        UPDATE FROM decks
		SET public = false
        WHERE id = $1
        RETURNING *;
    `;

	const values = [deckId];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};
