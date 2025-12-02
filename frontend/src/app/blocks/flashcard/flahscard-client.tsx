'use client';

import React, { useEffect, useState } from 'react';
import { useGetQuestionsByTopicId } from '@/services/question';
import { useSearchParams } from 'next/navigation';
import { useGetTopics } from '@/services/topic';
import { Card, CardContent } from '@/components/ui/card';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';

type Question = {
	id: number;
	question: string;
	answer: string;
	topicId: number;
	priority: number;
};
type Topic = { id: number; name: string; description?: string };

export default function FlashCardClient() {
	const { data: topics } = useGetTopics();
	const searchParams = useSearchParams();
	const topicIdParam = searchParams.get('topicId');
	const topicIds = topicIdParam
		? topicIdParam.split(',').filter(Boolean)
		: [];
	const { data: fetchedQuestions } = useGetQuestionsByTopicId(topicIds || []);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [flipped, setFlipped] = useState<{ [id: number]: boolean }>({});

	useEffect(() => {
		setQuestions(fetchedQuestions ?? []);
	}, [fetchedQuestions]);

	useEffect(() => {
		if (questions.length > 0) {
			setFlipped({});
		}
	}, [questions]);

	const handleFlip = (id: number) => {
		setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<div className="flex flex-col items-center min-h-screen pt-10 pb-20 px-4 sm:px-6 lg:px-8">
			<div className="text-3xl font-bold mb-2">Flash Cards</div>
			<div className="mb-2 text-base font-medium">
				Topics:&nbsp;
				{topics && topicIds.length > 0
					? topicIds
							.map(
								(id) =>
									topics.find(
										(t: Topic) => String(t.id) === id
									)?.name || 'Unknown'
							)
							.join(', ')
					: 'None'}
			</div>

			<div className="relative w-full max-w-md h-[400px]">
				<Carousel className="w-full h-full">
					<CarouselContent>
						{(questions || []).map((question, index) => (
							<CarouselItem key={index}>
								<Card
									className="w-full h-full cursor-pointer select-none flex items-center justify-center"
									onClick={() => handleFlip(question.id)}
								>
									<CardContent className="flex aspect-square items-center justify-center p-6 w-full h-full">
										<span className="text-4xl font-semibold text-center wrap-break-word">
											{flipped[question.id]
												? (<div className='text-[0.8em]'>{question.answer}</div>)
												: (<div className=''>{question.question}</div>)}
										</span>
									</CardContent>
								</Card>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious />
					<CarouselNext />
				</Carousel>
			</div>
		</div>
	);
}
