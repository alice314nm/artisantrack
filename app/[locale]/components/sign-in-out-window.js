import Link from 'next/link';
import React from 'react';
import { useUserAuth } from '@/app/[locale]/_utils/auth-context';

export default function SignInOutWindow({ type, text }) {
    const { firebaseSignOut } = useUserAuth();


    if (type == "SignOut") {
        return (
            <div className="flex items-center justify-center mt-20">
                <div className="bg-beige w-80 rounded-lg p-5 text-center">
                    <p>You're already signed in.</p>
                    <p>Do you want to sign out?</p>
                    <a onClick={firebaseSignOut} className="text-sky-500 underline">Sign out</a>

                </div>
            </div>

        );
    } else if (type == "SignIn") {
        return (
            <div className="flex items-center justify-center mt-20">
                <div className="bg-beige w-80 rounded-lg p-5 text-center">
                    <p>Please sign in to {text}</p>
                    <Link href='./signin' className="text-sky-500 underline">Go to sign in page</Link>
                </div>
            </div>

        );
    }


}