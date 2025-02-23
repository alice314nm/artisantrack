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

export default function BlockHolder({id, title, category, deadline, quantity, currency, color, total, imageSource, type}) {
    if (type=='product') {
        return (
            <div className="flex flex-col gap-2 w-full h-full ">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"/>
                </div>

                <div>
                    <p className="font-bold truncate max-w-[180px]">#{id} | {title}</p>
                    <p className="truncate max-w-[180px]">Category: {category}</p>
                    <p className="truncate max-w-[180px]">Avg.Total: {total}{currency}</p>
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
                    className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"/>
                </div>

                <div>
                    <p className="font-bold">#{id} | {title}</p>
                    <p>Deadline</p>
                    <p>{deadline}</p>
                    <p>Total: {total}{currency}</p>
                </div>
            </div>
        );
    }

    else if (type=='material') {
        return (
            
            <div className="flex flex-col gap-2 w-full h-full ">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"/>
                </div>

                <div>
                    <p className="font-bold truncate max-w-[180px]">#{id} | {title}</p>                    
                    <p className="truncate max-w-[180px]">Quantity: {quantity}</p>
                    <p className="truncate max-w-[180px]">Category: {category}</p>
                    <p className="truncate max-w-[180px]">Color: {color}</p>
                    <p className="truncate max-w-[180px]">Total cost: {total}{currency}</p>
                </div>
            </div>

        );
    }
}
