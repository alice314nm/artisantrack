import Link from 'next/link';
import React from 'react';

/*
    Header - component for header on page

    props:
    - title - title for the current page
    - userName - name of the user to show it in the header
*/

export default function Header({title, userName}){
    return(
        <header className="bg-beige font-bold flex flex-row p-4 items-center justify-between">
            <div className="gap-2 flex flex-row items-center justify-between">
                <img
                src="/LogoArtisanTrack.png"
                className="w-12 h-12 bg-gray-200"
                />
                <Link href="/"><p className="italic text-xl">{title}</p></Link>
            </div>
            {userName && (
                <div className="text-right">
                    <p>ArtisanTrack:</p>
                    <p>{userName}</p>
                </div>
            )}
        </header>
    );
}; 