'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Navbar() {
	const { data: session, status } = useSession();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const linkClasses =
		'text-black/80 transition-colors hover:text-black text-sm font-medium';

	const navBarClasses = 'w-full bg-transparent text-black';

	return (
		<nav className={navBarClasses}>
			{/* Main Flex Container */}
			<div className="flex h-14 items-center px-4 md:px-10">
				{/* Left Section: Logo & Main Navigation Links */}
				<div className="flex flex-1 items-center">
					{/* Logo (House Tutor) - Text color explicitly set to black */}
					<div className="flex-none flex items-center pr-4 md:pr-10">
						<Link href="/" className="flex items-center space-x-2">
							<span className="font-bold text-xl text-black">
								House Tutor
							</span>
						</Link>
					</div>

					{/* Desktop Navigation Links (Visible only on md screens and up) */}
					<nav className="hidden md:flex items-center space-x-6">
						<Link href="/decks" className={linkClasses}>
							Decks
						</Link>
						<Link href="/decks/add" className={linkClasses}>
							Add
						</Link>
						<Link href="/search" className={linkClasses}>
							Search
						</Link>
					</nav>
				</div>

				{/* Right Section: Auth/Account/Logout (Visible on all screens) */}
				<div className="flex-none flex items-center space-x-4">
					{status === 'loading' ? (
						<div className="h-8 w-8 animate-pulse rounded-full bg-black/30" />
					) : session ? (
						<>
							{/* Account & Logout links using black text */}
							<Link href="/profile" className={linkClasses}>
								Account
							</Link>
							<button
								onClick={() => signOut({ callbackUrl: '/' })}
								className={linkClasses}
							>
								Log Out
							</button>
						</>
					) : (
						// User is Logged Out (Login/Signup buttons)
						<>
							{/* Login button: hidden on small screens */}
							<Button
								variant="ghost"
								asChild
								// 🎯 FIX 1: Changed text color to black/dark
								className="hidden sm:inline-flex text-black/80 hover:bg-black/10"
							>
								<Link href="/auth/login">Login</Link>
							</Button>
							{/* Sign Up button */}
							<Button
								asChild
								className="bg-black text-white hover:bg-gray-800"
							>
								<Link href="/auth/signup">Sign Up</Link>
							</Button>
						</>
					)}

					{/* 🎯 FIX 2: Mobile Menu Button (Hamburger) */}
					<Button
						variant="ghost"
						className="md:hidden text-black p-2"
						onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle state
					>
						{isMenuOpen ? (
							<X className="h-6 w-6" /> // X icon when menu is open
						) : (
							<Menu className="h-6 w-6" /> // Menu icon when menu is closed
						)}
					</Button>
				</div>
			</div>

			{/* 🎯 FIX 2: Mobile Menu Content (Appears below the main nav bar) */}
			{isMenuOpen && (
				<div className="md:hidden flex flex-col items-start px-4 pb-4 space-y-2 bg-gray-50 border-t border-gray-200">
					<Link
						href="/blocks"
						className="w-full text-left text-black hover:bg-gray-100 py-2 px-2 rounded-md"
						onClick={() => setIsMenuOpen(false)} // Close menu on click
					>
						Decks
					</Link>
					<Link
						href="/blocks/create"
						className="w-full text-left text-black hover:bg-gray-100 py-2 px-2 rounded-md"
						onClick={() => setIsMenuOpen(false)}
					>
						Add
					</Link>
					<Link
						href="/admin"
						className="w-full text-left text-black hover:bg-gray-100 py-2 px-2 rounded-md"
						onClick={() => setIsMenuOpen(false)}
					>
						Search
					</Link>
				</div>
			)}
		</nav>
	);
}
