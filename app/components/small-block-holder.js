import React from 'react';

/*
    SmallBlockHolder - component to hol information of picture and its functionality

    props:
    - type - types: singlePictureDelete, multiplyPictureDelete, plainPicture
    - id - number of picture for "multiplyPictureDelete" type
    - imageSource - link to the image
    - onButtonFunction - function to delete picture from the chosen ones

    SmallBlockHolder types:
    1. singlePictureDelete: includes picture and delete number, no numeric
    2. multiplyPictureDelete: includes picture, delete number, number of picture
    3. plainPicture: includes only picture
*/

export default function SmallBlockHolder({ type, id, imageSource, onButtonFunction, mainStatus }) {
    
    if(type=="singlePictureDelete"){
        return (
            <div className="flex flex-col gap-2">
                <div className="relative">
                    <img src={imageSource} className="object-cover relative w-24 h-28 rounded-lg"/>
                </div>
                <button type="button" className="bg-red rounded-md w-24 text-white">delete</button>
            </div>
        );
    }
    else if (type=="multiplePictureDelete"){
        return (
            <div className="flex flex-col gap-2">
                <div className="relative">
                    <img src={imageSource} className="object-cover relative w-24 h-28 rounded-lg"/>
                    <div className="absolute top-1 left-1 bg-lightBeige border-2 border-blackBeige rounded-xl w-5 h-5 flex justify-center items-center">
                        <p className="text-xs">{id}</p>
                    </div>
                </div>
                <button type="button" onClick={onButtonFunction} className="bg-red rounded-md w-24 text-white ">delete</button>
            </div>
        );
    }
    else if (type=="plainPicture")
    {
        return (
            <img 
            src={imageSource} 
            className={`rounded-lg object-cover transition-all duration-300 ${mainStatus ? "w-24 h-28" : "w-24 h-24"}`} 
            onClick={onButtonFunction}
            />  
        );
    }
    
}
