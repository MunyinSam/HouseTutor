import { getDbConnection } from '../database/mssql.database';

// Create Question
export const createQuestion = async (
	question: string,
	answer: string,
	topicId: number
) => {
	const pool = await getDbConnection();
	const result = await pool
		.request()
		.input('question', question)
		.input('answer', answer)
		.input('topicId', topicId).query(`
			INSERT INTO [dbo].[questions] (question, answer, topicId)
			OUTPUT INSERTED.*
			VALUES (@question, @answer, @topicId)
		`);
	return result.recordset[0];
};

// Update Question
export const updateQuestion = async (
	id: string,
	question: string,
	answer: string,
	topicId: number
) => {
	const pool = await getDbConnection();
	const result = await pool
		.request()
		.input('id', id)
		.input('question', question)
		.input('answer', answer)
		.input('topicId', topicId).query(`
			UPDATE [dbo].[questions]
			SET question = @question, answer = @answer, topicId = @topicId, updatedAt = SYSDATETIME()
			OUTPUT INSERTED.*
			WHERE id = @id
		`);
	return result.recordset[0];
};

// Delete Question
export const deleteQuestion = async (id: string) => {
	const pool = await getDbConnection();
	const result = await pool.request().input('id', id).query(`
			DELETE FROM [dbo].[questions]
			OUTPUT DELETED.*
			WHERE id = @id
		`);
	return result.recordset[0];
};

// Get Question by ID
export const getQuestionById = async (id: string) => {
	const pool = await getDbConnection();
	const result = await pool.request().input('id', id).query(`
			SELECT * FROM [dbo].[questions]
			WHERE id = @id
		`);
	return result.recordset[0];
};

// Get All Questions
export const getAllQuestions = async () => {
	const pool = await getDbConnection();
	const result = await pool.request().query(`
			SELECT * FROM [dbo].[questions]
			ORDER BY createdAt DESC
		`);
	return result.recordset;
};
