import { getDbConnection } from '../database/mssql.database';

// Create Topic
export const createTopic = async (
	name: string,
	description: string | null = null
) => {
	const pool = await getDbConnection();
	const result = await pool
		.request()
		.input('name', name)
		.input('description', description).query(`
			INSERT INTO [dbo].[topics] (name, description)
			OUTPUT INSERTED.*
			VALUES (@name, @description)
		`);
	return result.recordset[0];
};

// Update Topic
export const updateTopic = async (
	id: string,
	name: string,
	description: string | null = null
) => {
	const pool = await getDbConnection();
	const result = await pool
		.request()
		.input('id', id)
		.input('name', name)
		.input('description', description).query(`
			UPDATE [dbo].[topics]
			SET name = @name, description = @description, updatedAt = SYSDATETIME()
			OUTPUT INSERTED.*
			WHERE id = @id
		`);
	return result.recordset[0];
};

// Delete Topic
export const deleteTopic = async (id: string) => {
	const pool = await getDbConnection();
	const result = await pool.request().input('id', id).query(`
			DELETE FROM [dbo].[topics]
			OUTPUT DELETED.*
			WHERE id = @id
		`);
	return result.recordset[0];
};

// Get Topic by ID
export const getTopicById = async (id: string) => {
	const pool = await getDbConnection();
	const result = await pool.request().input('id', id).query(`
			SELECT * FROM [dbo].[topics]
			WHERE id = @id
		`);
	return result.recordset[0];
};

// Get All Topics
export const getAllTopics = async () => {
	const pool = await getDbConnection();
	const result = await pool.request().query(`
			SELECT * FROM [dbo].[topics]
			ORDER BY createdAt DESC
		`);
	return result.recordset;
};
