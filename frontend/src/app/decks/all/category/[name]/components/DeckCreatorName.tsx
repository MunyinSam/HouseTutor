import { useGetUserById } from '@/services/user.service';

export function DeckCreatorName({ userId }: { userId: string }) {
	const { data: user, isLoading } = useGetUserById(userId);
    if (isLoading) return <span className='text-xs text-gray-400'>Loading...</span>
    return (
        <span className='text-xs text-gray-500'>
            By {user?.name || user?.email || 'Unknown'}
        </span>
    )
}
