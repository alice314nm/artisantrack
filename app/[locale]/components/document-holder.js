import React from 'react';

/*
    DocumentHolder - component to hold information about item to show it in the list

    props:
    - id - id of the item
    - title - title of the item
    - date - date fo the created item

*/

export default function DocumentHolder({id, title, date}) {
    
    return (
        <div className="flex flex-col gap-2 justify-between w-[100%] bg-beige rounded border border-darkBeige p-2">
            <div>
                <div className="flex flex-row justify-between">
                    <p className="font-bold">{title}</p>
                    <p>#{id}</p>
                </div>
                <p>Created on {date}</p>
            </div>
        </div>
    );
    
}
