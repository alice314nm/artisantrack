export default function MateriaOrderDisplay(imageSrc, name, id, index, quantity){
    return(
        <div className="flex flex-row w-full items-center gap-2 justify-between">
            <div className="flex flex-row gap-2 items-center">
                
                <div className="pt-[1px] pr-[1px] bg-lightBeige border-2 border-blackBeige rounded-xl w-6 h-6 flex justify-center items-center">
                    <p>{index}</p>
                </div>
                <img className="object-cover relative w-20 h-24 rounded-lg" src={imageSrc} />
                
                <div>
                    <p>#{id} | {name}</p>
                    <p>quantity:</p>
                    <p>{quantity}</p>
                </div>
            </div>           
        </div>
    );    
}

