import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Brain, Gamepad2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Navbar />
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
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Find Your Perfect House Tutor
              </h1>
              <p className="max-w-[600px] mx-auto text-gray-200 md:text-xl">
                Connect with experienced tutors for personalized home learning. Elevate your education from the comfort of your home.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg"className="bg-primary border-white border-2 text-white border-white hover:bg-white hover:text-black"><Link href="/blocks">Get Started</Link></Button>
              {/* <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white hover:text-black">Learn More</Button> */}
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-12 md:py-24 lg:py-32">
         <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
               <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                     Everything you need to manage your tutoring sessions effectively.
                  </p>
               </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
               <div className="flex flex-col justify-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                     <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">ANKI Flashcards</h3>
                  <p className="text-muted-foreground">
                     Master any subject with our spaced repetition system. Add questions and answers to create your own decks.
                  </p>
               </div>
               <div className="flex flex-col justify-center space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                     <Gamepad2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Question Minigame</h3>
                  <p className="text-muted-foreground">
                     Test your knowledge in a fun and interactive way. Challenge yourself and track your progress.
                  </p>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
