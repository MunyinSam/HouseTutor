import { getDbConnection } from '../database/mssql.database';
import { Pool } from 'pg';

export interface OcclusionRect {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	answer?: string;
}

// Create ImageOcclusion
export const createImageOcclusion = async (
	deckId: number,
	imagePath: string,
	occlusions: OcclusionRect[],
	title?: string,
	mode: string = 'all'
) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        INSERT INTO image_occlusions ("deckId", "imagePath", "occlusions", "title", "mode", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *;
    `;

	const values = [deckId, imagePath, JSON.stringify(occlusions), title, mode];
	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Update ImageOcclusion
export const updateImageOcclusion = async (
	id: number,
	title?: string,
	imagePath?: string,
	occlusions?: OcclusionRect[],
	mode?: string
) => {
	const pool: Pool = await getDbConnection();

	const updates: string[] = [];
	const values: unknown[] = [];
	let paramCount = 1;

	if (title !== undefined) {
		updates.push(`"title" = $${paramCount++}`);
		values.push(title);
	}
	if (imagePath !== undefined) {
		updates.push(`"imagePath" = $${paramCount++}`);
		values.push(imagePath);
	}
	if (occlusions !== undefined) {
		updates.push(`"occlusions" = $${paramCount++}`);
		values.push(JSON.stringify(occlusions));
	}
	if (mode !== undefined) {
		updates.push(`"mode" = $${paramCount++}`);
		values.push(mode);
	}

	if (updates.length === 0) {
		throw new Error('No fields to update');
	}

	values.push(id);
	const queryText = `
        UPDATE image_occlusions
        SET ${updates.join(', ')}, "updatedAt" = NOW()
        WHERE id = $${paramCount}
        RETURNING *;
    `;

	const result = await pool.query(queryText, values);
	return result.rows[0];
};

// Delete ImageOcclusion
export const deleteImageOcclusion = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        DELETE FROM image_occlusions
        WHERE id = $1
        RETURNING *;
    `;

	const result = await pool.query(queryText, [id]);
	return result.rows[0];
};

// Get ImageOcclusion by ID
export const getImageOcclusionById = async (id: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM image_occlusions
        WHERE id = $1;
    `;

	const result = await pool.query(queryText, [id]);
	return result.rows[0];
};

// Get all ImageOcclusions by Deck ID
export const getImageOcclusionsByDeckId = async (deckId: number) => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM image_occlusions
        WHERE "deckId" = $1
        ORDER BY id ASC;
    `;

	const result = await pool.query(queryText, [deckId]);
	return result.rows;
};

// Get all ImageOcclusions
export const getAllImageOcclusions = async () => {
	const pool: Pool = await getDbConnection();
	const queryText = `
        SELECT * FROM image_occlusions
        ORDER BY id ASC;
    `;

	const result = await pool.query(queryText);
	return result.rows;
};
