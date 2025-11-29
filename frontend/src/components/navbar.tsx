'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Home, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navbar() {
	const { data: session, status } = useSession();
	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-white">
			<div className="container flex h-14 items-center px-0">
				{/* Left: Logo */}
				<div className="flex-none flex items-center pl-6 pr-6">
					<Link href="/" className="flex items-center space-x-2">
						<span className="font-bold">House Tutor</span>
					</Link>
				</div>
				{/* Center: Nav */}
				<div className="flex-1 flex justify-center">
					<nav className="flex items-center space-x-6 text-sm font-medium">
						<Link
							href="/blocks"
							className="transition-colors hover:text-foreground/80 text-foreground/60"
						>
							Blocks
						</Link>
						<Link
							href="/blocks/create"
							className="transition-colors hover:text-foreground/80 text-foreground/60"
						>
							Questions
						</Link>
					</nav>
				</div>
				<div className="flex-none flex items-center space-x-2 justify-end pr-6">
					{status === 'loading' ? (
						<div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
					) : session ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<Avatar className="h-8 w-8">
										<AvatarImage
											src={session.user?.image || ''}
											alt={session.user?.name || ''}
										/>
										<AvatarFallback>
											{session.user?.name
												?.charAt(0)
												.toUpperCase() || 'U'}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-56"
								align="end"
								forceMount
							>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">
											{session.user?.name}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{session.user?.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<Link
										href="/profile"
										className="cursor-pointer"
									>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="cursor-pointer text-red-600"
									onClick={() =>
										signOut({ callbackUrl: '/' })
									}
								>
									<LogOut className="mr-2 h-4 w-4" />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button variant="ghost" asChild>
								<Link href="/login">Login</Link>
							</Button>
							<Button asChild>
								<Link href="/signup">Sign Up</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
