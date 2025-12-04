import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Brain, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col overflow-x-hidden">
			<section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
				<Image
					alt="House Tutor"
					className="object-cover -z-10"
					src="/house.jpg"
					fill
					priority
				/>
				<div className="absolute inset-0 bg-black/50 -z-10" />
				<div className="container px-4 md:px-6 relative z-10">
					<div className="flex flex-col items-start justify-center space-y-4 text-left text-white ml-10">
						<div className="space-y-2 ">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
								Dr. House is Available
							</h1>
							<p className="italic max-w-[600px] text-gray-200 md:text-xl">
								Don&apos;t bother &quot;finding&quot; a tutor.
								You found me. I&apos;m retired, miserable, and
								still brilliant. Now stop asking for saccharine
								nonsense and start learning something before you
								infect the rest of the population with your
								mediocrity.
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row">
							<Link href="/decks">
								<Button
									size="lg"
									className="bg-primary border-2 text-white border-white hover:bg-white hover:text-black cursor-pointer"
								>
									Get Started
								</Button>
							</Link>
							{/* <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-black">Learn More</Button> */}
						</div>
					</div>
				</div>
			</section>
			<section className="w-full py-12 md:py-24 lg:py-32">
				{/* The outer container centers the main content block and adds side padding */}
				<div className="container px-4 md:px-6">
					{/* Title and Description Section (Already Centered) */}
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
								The Necessary Evils (Tools)
							</h2>
							<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								These are the tools required to treat your
								chronic lack of knowledge. They&apos;re
								efficient, which is the only thing that matters.
								Now use them.
							</p>
						</div>
					</div>

					{/* Tools Grid Section (Already Centered with mx-auto and max-w-5xl) */}
					{/* Added text-left to the grid container to ensure the text alignment inside the cards remains left-aligned, as is typical for feature lists. */}
					<div className="mx-auto grid max-w-5xl items-start gap-12 py-12 lg:grid-cols-2 lg:gap-12 text-left">
						{/* Tool Card 1: Flashcards */}
						<div className="flex flex-col justify-start space-y-4 p-6 border rounded-lg shadow-lg">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
								<Brain className="h-6 w-6" />
							</div>
							<h3 className="text-xl font-bold">
								Flashcards: Your Memory is Defective. Treat it.
							</h3>
							<p className="text-muted-foreground">
								You think you&apos;ll remember that? You
								won&apos;t. Everybody lies, especially your own
								hippocampus. Spaced repetition is the only
								bitter pill that actually cures ignorance. Build
								your own decks and force the knowledge into your
								skull before it leaks out again.
							</p>
							{/* Added Button for User Flow */}
							<Link href="/blocks/create">
								<Button variant="outline" className="mt-4">
									Build a Deck
								</Button>
							</Link>
						</div>

						{/* Tool Card 2: Diagnostic Quiz */}
						<div className="flex flex-col justify-start space-y-4 p-6 border rounded-lg shadow-lg">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
								<Gamepad2 className="h-6 w-6" />
							</div>
							<h3 className="text-xl font-bold">
								The &apos;Are You an Idiot?&apos; Diagnostic
							</h3>
							<p className="text-muted-foreground">
								&quot;Fun and interactive&quot; is a marketing
								euphemism for &quot;a swift, clinical assessment
								of your factual deficiencies.&quot; Challenge
								yourself. Expose your flaws. And if you must,
								track the painful, slow progress of your brain
								healing.
							</p>
							{/* Added Button for User Flow */}
							<Link href="/quiz">
								<Button variant="outline" className="mt-4">
									Take the Diagnostic
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
