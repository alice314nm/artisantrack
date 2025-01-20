import React from 'react';

/*
    BLockHolder - component to hold information about item to show it in the list

    props:
    - id - id of the item
    - title - title of the item
    - category - one of the categories of the item
    - total - cost of the item
    - imageSource - link for the image of the item
    - type - type of the Block Holder

    type:
    - product
    - order
    - material
*/

export default function BlockHolder({id, title, category, deadline, quantity, color, total, imageSource, type}) {
    if (type=='product') {
        return (
            <div className="flex flex-col gap-2 w-full h-full sm:w-[40%] md:w-[80%] lg:w-[100%]">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 sm:h-44 md:h-52 lg:h-64 rounded-lg object-cover"/>
                </div>

                <div>
                    <p className="font-bold">#{id} | {title}</p>
                    <p>Category: {category}, ...</p>
                    <p>Average Total: ${total}</p>
                </div>
            </div>
        );
    }
    else if (type=='order') {
        return (
            <div className="flex flex-col gap-2 w-full h-full sm:w-[40%] md:w-[80%] lg:w-[100%]">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 sm:h-44 md:h-52 lg:h-64 rounded-lg object-cover"/>
                </div>

                <div>
                    <p className="font-bold">#{id} | {title}</p>
                    <p>Deadline</p>
                    <p>{deadline}</p>
                    <p>Total: ${total}</p>
                </div>
            </div>
        );
    }

    else if (type=='material') {
        return (
            <div className="flex flex-col gap-2 w-full h-full sm:w-[40%] md:w-[80%] lg:w-[100%]">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 sm:h-44 md:h-52 lg:h-64 rounded-lg object-cover"/>
                </div>

                <div>
                    <p className="font-bold">#{id} | {title}</p>
                    <p>Available quantity: {quantity}</p>
                    <p>Category: {category}</p>
                    <p>Color: {color}</p>
                    <p>Total cost: {total}$</p>
                </div>
            </div>
        );
    }
}
