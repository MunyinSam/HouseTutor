'use client';

import React, { useState } from 'react';
import { useGetTopics, useCreateTopic } from '@/services/topic';
import { useCreateQuestion } from '@/services/question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';

const CreateBlockPage = () => {
	const { data: topics = [] } = useGetTopics();
	const createTopic = useCreateTopic();
	const createQuestion = useCreateQuestion();
	const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
	const [newTopicName, setNewTopicName] = useState('');
	const [newTopicDescription, setNewTopicDescription] = useState('');
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState('');
	const [creatingNewTopic, setCreatingNewTopic] = useState(false);

	const handleCreateTopic = async (e: React.FormEvent) => {
		e.preventDefault();
		createTopic.mutate({
			name: newTopicName,
			description: newTopicDescription,
		});
		setNewTopicName('');
		setNewTopicDescription('');
		setCreatingNewTopic(false);
	};

	const handleCreateQuestion = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedTopic === null) return;
		createQuestion.mutate({ question, answer, topicId: selectedTopic });
		setQuestion('');
		setAnswer('');
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-8">
			<h2 className="text-2xl font-semibold mb-4">
				Create Topics & Questions
			</h2>
			<div className="w-full max-w-md flex flex-col gap-8">
				<div className="border p-4 rounded-lg">
					<h3 className="font-bold mb-2">
						Add a Question to Existing Topic
					</h3>
					<form
						onSubmit={handleCreateQuestion}
						className="flex flex-col gap-3"
					>
						<Combobox
							options={topics.map((t: any) => ({
								label: t.name,
								value: String(t.id),
							}))}
							value={
								selectedTopic !== null
									? String(selectedTopic)
									: null
							}
							onChange={(val) =>
								setSelectedTopic(val ? Number(val) : null)
							}
							placeholder="Select a topic"
						/>
						<Input
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							placeholder="Question"
							required
						/>
						<Input
							value={answer}
							onChange={(e) => setAnswer(e.target.value)}
							placeholder="Answer"
							required
						/>
						<Button type="submit" disabled={!selectedTopic}>
							Add Question
						</Button>
					</form>
				</div>
				<div className="border p-4 rounded-lg">
					<h3 className="font-bold mb-2">Create a New Topic</h3>
					<form
						onSubmit={handleCreateTopic}
						className="flex flex-col gap-3"
					>
						<Input
							value={newTopicName}
							onChange={(e) => setNewTopicName(e.target.value)}
							placeholder="Topic Name"
							required
						/>
						<Input
							value={newTopicDescription}
							onChange={(e) =>
								setNewTopicDescription(e.target.value)
							}
							placeholder="Description (optional)"
						/>
						<Button type="submit">Create Topic</Button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateBlockPage;
