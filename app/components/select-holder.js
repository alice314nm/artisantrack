export default function SelectHolder({type, imageSource, name, id, quantity, selected, index, onClick}){

    if (type==="product") {
        return (
            <div className="flex flex-col gap-2 w-full h-full ">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"/>
                </div>

                <div className="flex flex-col gap-1">
                    <p className="truncate max-w-[180px]">#{id} | {name}</p>
                    <button type="button" onClick={onClick} className={selected ? "rounded-full bg-darkGreen text-white w-full" : "rounded-full bg-green w-full"}>{selected ? "selected" : "select"}</button>
                </div>
            </div>
        );
    }
    else if (type==="material") {
        return (
            <div className="flex flex-col gap-2 w-full h-full ">
                <div>
                    <img 
                    src={imageSource}
                    className="h-48 w-44 sm:h-44 sm:w-40 md:h-52 md:w-48 lg:h-64 lg:w-60 rounded-lg object-cover"/>
                </div>

                <div className="flex flex-col gap-1">
                    <p className="truncate max-w-[180px]">#{id} | {name}</p>
                    <p>Quantity: {quantity}</p>
                    <div className="flex flex-row gap-1">
                    <button type="button" onClick={onClick} className={selected ? "h-8 rounded-full bg-darkGreen text-white w-[60%]" : "h-8 rounded-full bg-green w-full"}>{selected ? "selected" : "select"}</button>
                    {selected && (
                        <input
                        placeholder="0"
                        className="h-8 rounded-lg border p-2 w-[60%]"
                        ></input>)}
                    </div>
                    
                </div>
            </div>
        );
    } 

}