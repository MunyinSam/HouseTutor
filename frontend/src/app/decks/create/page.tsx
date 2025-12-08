'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCreateDeck } from '@/services/deck.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { GoogleSession } from '@/types';

export default function CreateDeckPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const createDeck = useCreateDeck();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const userId = (session as GoogleSession)?.userId;
		if (!userId) {
			alert('You must be logged in to create a deck');
			return;
		}

		try {
			await createDeck.mutateAsync({
				title,
				description: description || null,
				category,
				ownerId: userId,
			});
			router.push('/decks');
		} catch (error) {
			console.error('Error creating deck:', error);
			alert('Failed to create deck');
		}
	};

	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">
					Please sign in to add decks
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			<Image
				alt="House Tutor"
				src="/house2.png"
				fill
				className="object-cover -z-10"
				priority
			/>
			<div className="absolute inset-0 bg-black/10 -z-5"></div>
			<div className="relative z-10 p-8">
				<div className="max-w-2xl mx-auto">
					<Button
						variant="ghost"
						onClick={() => router.back()}
						className="mb-4"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back
					</Button>

					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">
								Create New Deck
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="title">Deck Title *</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										placeholder="e.g., Spanish Vocabulary"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="category">Category *</Label>
									<Input
										id="category"
										value={category}
										onChange={(e) =>
											setCategory(e.target.value)
										}
										placeholder="e.g., Language, Science, History"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="description">
										Description
									</Label>
									<Textarea
										id="description"
										value={description}
										onChange={(e) =>
											setDescription(e.target.value)
										}
										placeholder="Optional: Describe what this deck covers"
										rows={4}
									/>
								</div>

								<div className="flex gap-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.back()}
										className="flex-1"
									>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={createDeck.isPending}
										className="flex-1 bg-blue-200 border-2 border-blue-500 hover:bg-blue-300 text-black"
									>
										{createDeck.isPending && (
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										)}
										Create Deck
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
