'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGetAllDecks } from '@/services/deck.service';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	CardContent,
} from '@/components/ui/card';
import { LayoutGrid, Layers, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeckPage() {
	const router = useRouter();
	const { data: session } = useSession();
	const { data: decks, isLoading } = useGetAllDecks();

	// Extract unique categories with deck count
	const categories = useMemo(() => {
		if (!decks) return [];
		const categoryMap = new Map<string, number>();
		decks.forEach((deck) => {
			const count = categoryMap.get(deck.category) || 0;
			categoryMap.set(deck.category, count + 1);
		});
		return Array.from(categoryMap.entries()).map(([name, count]) => ({
			name,
			count,
		}));
	}, [decks]);

	const handleCategoryClick = (categoryName: string) => {
		router.push(`/decks/all/category/${encodeURIComponent(categoryName)}`);
	};

	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">
					Please sign in to view decks
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-8 bg-gray-50">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center">
					<LayoutGrid className="w-8 h-8 mr-2 text-blue-600" />
					Browse by Category
				</h1>
				<p className="text-gray-600">
					Select a category to view available decks.
				</p>
			</header>

			<div className="flex justify-end mb-5">
				<Button
					className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black"
					onClick={() => router.push('/decks/create')}
				>
					Add Deck
				</Button>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center py-20">
					<p className="text-gray-600">Loading categories...</p>
				</div>
			) : categories.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{categories.map((category) => (
						<Card
							key={category.name}
							onClick={() => handleCategoryClick(category.name)}
							className="transition-shadow duration-300 hover:shadow-lg hover:border-blue-400 cursor-pointer"
						>
							<CardHeader className="p-4 pb-2">
								<CardTitle className="text-lg font-semibold text-gray-800 truncate flex items-center">
									<FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
									{category.name}
								</CardTitle>
								<CardDescription className="text-sm text-blue-600 font-medium">
									{category.count} deck
									{category.count !== 1 ? 's' : ''}
								</CardDescription>
							</CardHeader>

							<CardContent className="p-4 pt-0">
								<p className="text-gray-500 text-sm">
									Click to browse decks in this category
								</p>
							</CardContent>

							<CardFooter className="flex justify-between items-center p-4 pt-2 border-t bg-gray-50 rounded-b-lg">
								<div className="flex items-center text-sm font-medium text-gray-700">
									<Layers className="w-4 h-4 mr-1 text-gray-500" />
									View decks
								</div>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-20">
					<p className="text-gray-600 mb-4">No categories found</p>
					<Button
						className="bg-blue-200 border border-blue-500 hover:bg-blue-300 text-black"
						onClick={() => router.push('/decks/create')}
					>
						Create Your First Deck
					</Button>
				</div>
			)}
		</div>
	);
}
