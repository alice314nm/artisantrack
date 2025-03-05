'use client'

import { useState } from "react";
import SlideMenu from "./slide-menu";

export default function Menu({
  type,
  onFirstFunction,
  onSecondFunction,
  onThirdFunction,
  iconFirst,
  iconSecond,
  firstTitle,
  secondTitle,
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const containerClasses = "z-0 fixed w-full bottom-0 right-0 flex flex-col justify-end h-[auto] text-sm";
  const buttonMenuClasses = "rounded-md flex-shrink-0 text-sm";
  const menuBurgerClasses = "w-10 h-10 text-sm";
  const greenButtonClasses = "py-2 bg-green rounded-md items-center justify-center flex flex-row gap-1 text-sm"; // Reduced py-3 to py-2
  const redButtonClasses = "py-3 bg-red rounded-md text-white text-sm"; // Reduced py-4 to py-3
  const bottomMenuClasses = "flex flex-row h-16 bg-beige font-bold px-4 py-2 gap-2 items-center text-sm"; // Adjusted h-20 to h-16

  const toggleMenu = () => {
    setIsMenuVisible((prev) => !prev);
  };

  return (
    <div>
      {/* TwoButtonsMenu */}
      {type === "TwoButtonsMenu" && (
        <div className={containerClasses}>
          <SlideMenu menuVisible={isMenuVisible} />
          <div className={`${bottomMenuClasses} justify-center`}>
            <button
              data-id="menu-button"
              className={buttonMenuClasses}
              onClick={toggleMenu}
            >
              <img src="/MenuBurger.png" className={menuBurgerClasses} alt="Menu" />
            </button>

            <button
              className={`${greenButtonClasses} w-[50%]`}
              onClick={onFirstFunction}
            >
              <p>{firstTitle}</p>
              {iconFirst && <img src={iconFirst} width={15} />}
            </button>

            <button
              className={`${greenButtonClasses} w-[50%]`}
              onClick={onSecondFunction}
            >
              <p>{secondTitle}</p>
              {iconSecond && <img src={iconSecond} width={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Create Menu */}
      {type === "CreateMenu" && (
        <div className="flex h-16 flex-row font-bold py-2 gap-2 items-center justify-center"> {/* Reduced h-20 to h-16 */}
          <button
            type="button"
            className={`${redButtonClasses} w-[30%]`}
            onClick={onFirstFunction}
          >
            <p>{firstTitle}</p>
          </button>

          <button
            data-id="create-button"
            className={`py-3 bg-green rounded-md w-[70%]`} 
            onClick={onSecondFunction}
          >
            <p>{secondTitle}</p>
          </button>
        </div>
      )}

      {/* Only Slide Menu */}
      {type === "OnlySlideMenu" && (
        <div className={containerClasses}>
          <SlideMenu menuVisible={isMenuVisible} x />
          <div className={`${bottomMenuClasses} justify-start`}>
            <button
              data-id="menu-button"
              className={buttonMenuClasses}
              onClick={toggleMenu}
            >
              <img src="/MenuBurger.png" className={menuBurgerClasses} alt="Menu" />
            </button>
          </div>
        </div>
      )}

      {/* One Button Menu */}
      {type === "OneButtonMenu" && (
        <div className={containerClasses}>
          <SlideMenu menuVisible={isMenuVisible} />
          <div className={`${bottomMenuClasses} justify-center`}>
            <button className={buttonMenuClasses} onClick={toggleMenu}>
              <img src="/MenuBurger.png" className={menuBurgerClasses} />
            </button>

            <button
              className={`${greenButtonClasses} w-[100%]`}
              onClick={onFirstFunction}
            >
              <p>{firstTitle}</p>
              {iconFirst && <img src={iconFirst} width={15} />}
            </button>
          </div>
        </div>
      )}

      {/* Select Menu */}
      {type === "SelectMenu" && (
        <div className={containerClasses}>
          <div className="flex flex-row h-12 bg-beige font-bold px-4 py-2 gap-2 items-center justify-between"> {/* Reduced h-14 to h-12 */}
            <button 
              onClick={onFirstFunction} 
              className="flex flex-row gap-2 w-[28%] justify-center items-center"
            >
              <img src="/arrow-left.png" className="w-5"/>
              <p className="underline">Go back</p>
            </button>
            <button 
              onClick={onSecondFunction} 
              className="bg-red rounded-md py-1 text-white w-[33%]"
            >
              Reset
            </button>
            <button 
              onClick={onThirdFunction} 
              className="bg-green rounded-md py-1 w-[33%]"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
