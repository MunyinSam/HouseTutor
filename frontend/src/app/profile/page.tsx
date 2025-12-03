'use client';

import { useSession } from 'next-auth/react';
import { UserCircle2, Mail, LayoutList } from 'lucide-react'; // Icons from lucide-react for better visual structure

type ProfileDetailProps = {
	icon?: React.ComponentType<{ className?: string }>;
	label: string;
	value?: string;
};

const ProfileDetail = ({ icon: Icon, label, value }: ProfileDetailProps) => (
	<div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
		{Icon && <Icon className="h-5 w-5 text-indigo-500 shrink-0" />}
		<div className="flex flex-col">
			<span className="text-xs font-medium text-gray-500">{label}</span>
			<span className="text-sm font-semibold text-gray-800 wrap-break-word">
				{value || 'N/A'}
			</span>
		</div>
	</div>
);

export default function ProfilePage() {
	// Note: Assuming this component is rendered inside a <SessionProvider>
	const { data: session, status } = useSession();

	// Show a minimal loading state while authentication status is being determined
	if (status === 'loading') {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
				<div className="text-lg font-medium text-gray-600">
					Loading profile...
				</div>
			</div>
		);
	}

	// Show a message if the user is not authenticated
	if (status === 'unauthenticated') {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
				<div className="p-8 bg-white rounded-xl shadow-lg text-center">
					<h2 className="text-2xl font-bold text-red-600 mb-4">
						Access Denied
					</h2>
					<p className="text-gray-600">
						Please log in to view your profile.
					</p>
				</div>
			</div>
		);
	}

	// Main Content: Centered Profile Card
	return (
		// Outer Container: Sets full screen height and centers the content vertically and horizontally
		<div className="min-h-screen flex items-start justify-center bg-gray-50 pt-20 pb-10 sm:pt-32">
			{/* Profile Card Container */}
			<div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-xl">
				<h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center border-b pb-4">
					User Profile
				</h1>

				{/* Profile Image/Placeholder */}
				<div className="flex justify-center mb-8">
					{session?.user?.image ? (
						// If an image URL is available, use it
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={session.user.image}
							alt={`${session.user.name}'s profile`}
							className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-300 shadow-lg"
							onError={(e) => {
								e.currentTarget.onerror = null;
								e.currentTarget.src =
									'https://placehold.co/96x96/E0F2F1/14B8A6?text=User';
							}}
						/>
					) : (
						// Placeholder icon if no image is available
						<UserCircle2 className="h-24 w-24 text-indigo-400 border-2 border-indigo-300 rounded-full p-1" />
					)}
				</div>

				{/* User Details Grid */}
				<div className="space-y-4">
					<ProfileDetail
						icon={UserCircle2}
						label="User Name"
						value={session?.user?.name || 'Guest User'}
					/>

					<ProfileDetail
						icon={Mail}
						label="Email Address"
						value={session?.user?.email || ''}
					/>
					{/* 
					<ProfileDetail
						icon={LayoutList}
						label="Authentication ID"
						// Using a placeholder for a unique ID since 'image' is inappropriate for a display field
						// and we don't have the actual authentication ID from `useSession`.
						// For a real app, this would be a user ID from the database/auth provider.
						value={'************ (Protected)'}
					/> */}
				</div>
			</div>
		</div>
	);
}
