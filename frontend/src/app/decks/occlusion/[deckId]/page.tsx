'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	ArrowLeft,
	Plus,
	Play,
	Edit,
	Trash2,
	Image as ImageIcon,
} from 'lucide-react';
import {
	useGetImageOcclusionsByDeckId,
	useDeleteImageOcclusion,
} from '@/services/imageOcclusion.service';

interface PageProps {
	params: Promise<{ deckId: string }>;
}

export default function OcclusionListPage({ params }: PageProps) {
	const { deckId } = use(params);
	const router = useRouter();
	const { data: session } = useSession();

	const { data: occlusions, isLoading } = useGetImageOcclusionsByDeckId(
		parseInt(deckId)
	);
	const { mutate: deleteOcclusion } = useDeleteImageOcclusion();

	const handleDelete = (id: number) => {
		deleteOcclusion(id);
	};

	const getImageUrl = (imagePath: string) => {
		if (imagePath.startsWith('http')) return imagePath;
		return `/api/images/${imagePath}`;
	};

	if (!session) {
		return (
			<div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
				<p className="text-xl text-gray-600">
					Please sign in to view occlusions
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white border-b px-6 py-4">
				<div className="flex items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.push('/decks')}
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back to Decks
						</Button>
						<h1 className="text-xl font-semibold">
							Image Occlusions
						</h1>
					</div>
					<Button
						onClick={() =>
							router.push(`/decks/occlusion/${deckId}/create`)
						}
					>
						<Plus className="w-4 h-4 mr-2" />
						New Occlusion
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto p-6">
				{isLoading ? (
					<div className="flex justify-center items-center py-20">
						<p className="text-gray-600">Loading occlusions...</p>
					</div>
				) : occlusions && occlusions.length > 0 ? (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{occlusions.map((occ) => (
							<Card
								key={occ.id}
								className="overflow-hidden hover:shadow-lg transition-shadow"
							>
								{/* Image Preview */}
								<div className="relative h-48 bg-gray-100">
									<img
										src={getImageUrl(occ.imagePath)}
										alt={occ.title || 'Occlusion'}
										className="w-full h-full object-cover"
									/>
									<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
										<Button
											variant="secondary"
											onClick={() =>
												router.push(
													`/decks/occlusion/${deckId}/study/${occ.id}`
												)
											}
										>
											<Play className="w-4 h-4 mr-2" />
											Study
										</Button>
									</div>
									{/* Tape count badge */}
									<div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
										{Array.isArray(occ.occlusions)
											? occ.occlusions.length
											: 0}{' '}
										tapes
									</div>
								</div>

								<CardHeader className="pb-2">
									<CardTitle className="text-lg truncate">
										{occ.title || 'Untitled Occlusion'}
									</CardTitle>
									<CardDescription>
										Mode:{' '}
										{occ.mode === 'all'
											? 'Hide All, Reveal One'
											: 'Hide One, Show Others'}
									</CardDescription>
								</CardHeader>

								<CardFooter className="flex justify-between pt-2 border-t">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											router.push(
												`/decks/occlusion/${deckId}/study/${occ.id}`
											)
										}
									>
										<Play className="w-4 h-4 mr-1" />
										Study
									</Button>

									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												router.push(
													`/decks/occlusion/${deckId}/edit/${occ.id}`
												)
											}
										>
											<Edit className="w-4 h-4" />
										</Button>

										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
												>
													<Trash2 className="w-4 h-4 text-red-500" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>
														Delete Occlusion?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be
														undone. This will
														permanently delete this
														image occlusion.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>
														Cancel
													</AlertDialogCancel>
													<AlertDialogAction
														onClick={() =>
															handleDelete(occ.id)
														}
														className="bg-red-600 hover:bg-red-700"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</CardFooter>
							</Card>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center py-20">
						<ImageIcon className="w-16 h-16 text-gray-300 mb-4" />
						<p className="text-gray-600 mb-4">
							No image occlusions yet
						</p>
						<p className="text-gray-500 text-sm mb-6 text-center max-w-md">
							Image occlusions help you memorize parts of an image
							by hiding them with &quot;tapes&quot; that you can
							click to reveal.
						</p>
						<Button
							onClick={() =>
								router.push(`/decks/occlusion/${deckId}/create`)
							}
						>
							<Plus className="w-4 h-4 mr-2" />
							Create Your First Occlusion
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
