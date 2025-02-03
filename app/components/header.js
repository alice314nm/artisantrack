'use client'

import Link from 'next/link';
import React, { useEffect } from 'react';
import { useUserAuth } from '../_utils/auth-context';

/*
    Header - component for header on page

    props:
    - title - title for the current page
    - showUserName - true: show header with user name
*/

export default function Header({title, showUserName}){
    const { user } = useUserAuth();

    useEffect(() => {

    }, [user]);

    return(
        <header className="bg-beige font-bold flex flex-row p-4 items-center justify-between">
            <div className="gap-2 flex flex-row items-center justify-between">
                <img
                src="/LogoArtisanTrack.png"
                className="w-12 h-12 bg-gray-200"
                />
                <Link href="/"><p className="italic text-xl">{title}</p></Link>
            </div>
            {showUserName && (
                <div className="text-right">
                    <p>Artisan:</p>
                    <p>{user.displayName}</p>
                </div>
            )}
        </header>
    );
}; 