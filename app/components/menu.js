"use client";

import React, { useState } from "react";
import SlideMenu from "./slide-menu";

/*  
    props
    - type: one of the 4 types (described below)
    
    - onFirstFunction - function for left button
    - onSecondFunction - function for right button

    - iconFirst - image for the left button
    - iconSecond - image for the right button

    - firstTitle - title for the left button
    - secondTitle - title for the right button


    -------------------------------
    Menu Types:

    -TwoButtonsMenu
    -Includes: Slide menu, copy function, add item function/View 

    - Create Menu
    - Includes: cancel function, confirm function

    - Only Slide Menu
    - Includes: Slide Menu

    - One Button Menu
    - Includes: Slide Menu, function for one button
*/

export default function Menu({
  type,
  onFirstFunction,
  onSecondFunction,
  iconFirst,
  iconSecond,
  firstTitle,
  secondTitle,
}) {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible((prev) => !prev);
  };

  return (
    <div>
      {/* 
                TwoButtonsMenu
                Includes: Slide menu, copy function, add item function/View 
             */}
      {type === "TwoButtonsMenu" && (
        <div className="z-0 fixed w-full bottom-0 right-0 flex flex-col justify-end">
          {/* Slide Menu */}
          <SlideMenu menuVisible={isMenuVisible} />

          {/* Bottom Menu */}
          <div className="flex flex-row h-20 bg-beige font-bold px-4 py-3 gap-2 items-center justify-center">
            <button
              data-id="menu-button"
              className="rounded-xl flex-shrink-0"
              onClick={toggleMenu}
            >
              <img src="/MenuBurger.png" className="w-10 h-13" alt="Menu" />
            </button>

            <button
              className="py-3 bg-green rounded-xl w-[50%] items-center justify-center flex flex-row gap-1"
              onClick={onFirstFunction}
            >
              <p>{firstTitle}</p>
              {iconFirst && <img src={iconFirst} width={18} />}
            </button>

            <button
              className="py-3 bg-green rounded-xl w-[50%] items-center justify-center flex flex-row gap-1"
              onClick={onSecondFunction}
            >
              <p>{secondTitle}</p>
              {iconSecond && <img src={iconSecond} width={18} />}
            </button>
          </div>
        </div>
      )}

      {/* 
                Create Menu
                Includes: cancel function, confirm function 
             */}
      {type === "CreateMenu" && (
        <div className="flex h-20 flex-row font-bold py-2 gap-2 items-center justify-center">
          <button
            type="button"
            className="py-4 bg-red rounded-xl text-white w-[50%]"
            onClick={onFirstFunction}
          >
            <p>{firstTitle}</p>
          </button>

          <button
            data-id="create-button"
            className="py-4 bg-green rounded-xl w-[50%]"
            onClick={onSecondFunction}
          >
            <p>{secondTitle}</p>
          </button>
        </div>
      )}

      {/* 
                Only Slide Menu
                Includes: Slide Menu
             */}
      {type === "OnlySlideMenu" && (
        <div className="z-0 fixed w-full bottom-0 right-0 flex flex-col justify-end">
          {/* Slide Menu */}
          <SlideMenu menuVisible={isMenuVisible} />

          {/* Bottom Menu */}
          <div className="flex flex-row h-20 bg-beige font-bold px-4 py-3 gap-2 items-center justify-start">
            <button className="rounded-xl flex-shrink-0" onClick={toggleMenu}>
              <img src="/MenuBurger.png" className="w-10 h-13" alt="Menu" />
            </button>
          </div>
        </div>
      )}

      {/* 
                One Button Menu
                Includes: Slide Menu, function for one button
             */}
      {type === "OneButtonMenu" && (
        <div className="z-0 fixed w-full bottom-0 right-0 flex flex-col justify-end">
          {/* Slide Menu */}
          <SlideMenu menuVisible={isMenuVisible} />

          {/* Bottom Menu */}
          <div className="flex flex-row h-20 bg-beige font-bold px-4 py-3 gap-2 items-center justify-center">
            <button className="rounded-xl flex-shrink-0" onClick={toggleMenu}>
              <img src="/MenuBurger.png" className="w-10 h-13" />
            </button>

            <button
              className="py-3 bg-green rounded-xl w-[100%]"
              onClick={onFirstFunction}
            >
              <p>{firstTitle}</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
