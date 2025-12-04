import { createUser, getUserByEmail } from '@/services/user.service';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
		}),
	],
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === 'google' && user.email) {
				try {
					const existingUser = await getUserByEmail(user.email);

					if (!existingUser) {
						const payload = {
							id: user.id || profile?.sub || '',
							email: user.email,
							name: user.name || null,
						};

						await createUser(payload);
					}
					return true;
				} catch (error) {
					console.error('Error during sign in:', error);
					return false;
				}
			}
			return true;
		},
	},
});

export { handler as GET, handler as POST };
