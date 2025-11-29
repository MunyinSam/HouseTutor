'use client';

import React, { useState } from 'react';
import { useGetTopics, useCreateTopic } from '@/services/topic';
import { useCreateQuestion } from '@/services/question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/navbar';
import Image from 'next/image';

const CreateBlockPage = () => {
	const queryClient = useQueryClient();
	const { data: topics = [] } = useGetTopics();
	const createTopic = useCreateTopic();
	const createQuestion = useCreateQuestion();
	const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
	const [newTopicName, setNewTopicName] = useState('');
	const [newTopicDescription, setNewTopicDescription] = useState('');
	const [question, setQuestion] = useState('');
	const [answer, setAnswer] = useState('');

	const handleCreateTopic = async (e: React.FormEvent) => {
		e.preventDefault();
		createTopic.mutate(
			{
				name: newTopicName,
				description: newTopicDescription,
			},
			{
				onSuccess: (data) => {
					queryClient.invalidateQueries({ queryKey: ['topics'] });
					setSelectedTopic(data.id); // Optionally select the new topic
				},
			}
		);
		setNewTopicName('');
		setNewTopicDescription('');
	};

	const handleCreateQuestion = async (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedTopic === null) return;
		createQuestion.mutate({ question, answer, topicId: selectedTopic });
		setQuestion('');
		setAnswer('');
	};

	return (
		// 1. Change min-h-screen to h-screen to make it exactly the viewport height
		// 2. Add overflow-hidden to prevent any scrolling on the main container
		<div className="flex h-screen flex-col overflow-hidden">
			<Navbar />
			{/* The rest of the page content wrapper */}
			{/* Use flex-grow (or flex-1) to make this div take up all remaining vertical space */}
			{/* The min-h-screen was redundant here and caused the issue. Removing it and centering the content vertically will resolve the scroll problem. */}
			{/* If the content must be vertically centered AND fill the screen, use h-full. */}
			<div className="flex flex-col items-center justify-center">
				<Image
					alt="House Tutor"
					className="object-cover -z-10 scale-100 object-center"
					src="/house2.png"
					fill
					priority
				/>
				<div className="bg-white opacity-98 p-5 px-8 rounded-lg mt-5">
					<h2 className="text-2xl font-semibold mb-4">Add Stuff</h2>
					<div className="w-full max-w-md flex flex-col gap-8">
						<div className="border p-4 rounded-lg">
							<h3 className="font-bold mb-2">Add Question</h3>
							<form
								onSubmit={handleCreateQuestion}
								className="flex flex-col gap-3"
							>
								<Combobox
									options={topics.map(
										(t: { id: number; name: string }) => ({
											label: t.name,
											value: String(t.id),
										})
									)}
									value={
										selectedTopic !== null
											? String(selectedTopic)
											: null
									}
									onChange={(val) =>
										setSelectedTopic(
											val ? Number(val) : null
										)
									}
									placeholder="Select the current failure category"
								/>
								<Input
									value={question}
									onChange={(e) =>
										setQuestion(e.target.value)
									}
									placeholder="The problem (Question)"
									required
								/>
								<Input
									value={answer}
									onChange={(e) => setAnswer(e.target.value)}
									placeholder="The only correct solution (Answer)"
									required
								/>
								<Button type="submit" disabled={!selectedTopic}>
									Add Diagnostic Challenge
								</Button>
							</form>
						</div>
						<div className="border p-4 rounded-lg">
							<h3 className="font-bold mb-2">New Topic</h3>
							<form
								onSubmit={handleCreateTopic}
								className="flex flex-col gap-3"
							>
								<Input
									value={newTopicName}
									onChange={(e) =>
										setNewTopicName(e.target.value)
									}
									placeholder="(Topic Name)"
									required
								/>
								<Input
									value={newTopicDescription}
									onChange={(e) =>
										setNewTopicDescription(e.target.value)
									}
									placeholder="Describe the scope (Optional)"
								/>
								<Button type="submit">
									New Topic
								</Button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateBlockPage;
