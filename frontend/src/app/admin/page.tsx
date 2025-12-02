'use client';

import React, { useMemo, useState } from 'react';
import {
	useGetQuestions,
	useDeleteQuestion,
	useUpdateQuestion,
	Question,
} from '@/services/question';
import { useGetTopics, Topic } from '@/services/topic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function QuestionsAdminTable() {
	const { data: questions = [], isLoading } = useGetQuestions();
	const { data: topics = [] } = useGetTopics();
	const deleteQuestion = useDeleteQuestion();
	const updateQuestion = useUpdateQuestion();

	const [filterTopic, setFilterTopic] = useState('all');
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const [editId, setEditId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState({ question: '', answer: '' });

	// Filter and paginate
	const filteredQuestions = useMemo(() => {
		let filtered = questions;
		if (filterTopic && filterTopic !== 'all') {
			filtered = filtered.filter(
				(q: Question) => String(q.topicId) === filterTopic
			);
		}
		return filtered;
	}, [questions, filterTopic]);

	const paginatedQuestions = useMemo(() => {
		const start = (page - 1) * pageSize;
		return filteredQuestions.slice(start, start + pageSize);
	}, [filteredQuestions, page, pageSize]);

	const totalPages = Math.ceil(filteredQuestions.length / pageSize);

	return (
		<div className="p-30 w-full overflow-y-auto">
			<h2 className="text-2xl font-bold mb-4">Questions Admin Table</h2>
			<div className="mb-4 flex gap-4 items-center">
				<Select value={filterTopic} onValueChange={setFilterTopic}>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Filter by Topic" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						{topics.map((t: Topic) => (
							<SelectItem key={t.id} value={String(t.id)}>
								{t.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Question</TableHead>
						<TableHead>Answer</TableHead>
						<TableHead>Topic</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center">
								Loading...
							</TableCell>
						</TableRow>
					) : paginatedQuestions.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="text-center">
								No questions found
							</TableCell>
						</TableRow>
					) : (
						paginatedQuestions.map((row: Question) => {
							const isEditing = editId === row.id;
							return (
								<TableRow key={row.id}>
									<TableCell>{row.id}</TableCell>
									<TableCell>
										{isEditing ? (
											<Input
												value={editValue.question}
												onChange={(e) =>
													setEditValue((v) => ({
														...v,
														question:
															e.target.value,
													}))
												}
											/>
										) : (
											row.question
										)}
									</TableCell>
									<TableCell>
										{isEditing ? (
											<Input
												value={editValue.answer}
												onChange={(e) =>
													setEditValue((v) => ({
														...v,
														answer: e.target.value,
													}))
												}
											/>
										) : (
											row.answer
										)}
									</TableCell>
									<TableCell>
										{topics.find(
											(t: Topic) =>
												String(t.id) ===
												String(row.topicId)
										)?.name || row.topicId}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											{isEditing ? (
												<>
													<Button
														size="sm"
														onClick={() => {
															updateQuestion.mutate(
																{
																	id: row.id,
																	body: {
																		...row,
																		...editValue,
																	},
																}
															);
															setEditId(null);
														}}
													>
														Save
													</Button>
													<Button
														size="sm"
														variant="secondary"
														onClick={() =>
															setEditId(null)
														}
													>
														Cancel
													</Button>
												</>
											) : (
												<>
													<Button
														size="sm"
														onClick={() => {
															setEditId(row.id);
															setEditValue({
																question:
																	row.question,
																answer: row.answer,
															});
														}}
													>
														Edit
													</Button>
													<Button
														size="sm"
														variant="destructive"
														onClick={() =>
															deleteQuestion.mutate(
																row.id
															)
														}
													>
														Delete
													</Button>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>

			<div className="flex items-center justify-between mt-4">
				<div className="text-sm text-muted-foreground">
					Showing {(page - 1) * pageSize + 1} to{' '}
					{Math.min(page * pageSize, filteredQuestions.length)} of{' '}
					{filteredQuestions.length} questions
				</div>
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</Button>
					<div className="flex items-center gap-2">
						<span className="text-sm">
							Page {page} of {totalPages}
						</span>
					</div>
					<Button
						size="sm"
						variant="outline"
						onClick={() =>
							setPage((p) => Math.min(totalPages, p + 1))
						}
						disabled={page === totalPages}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
