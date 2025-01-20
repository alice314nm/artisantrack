import React from 'react';

/*
  ConfirmationWindow - component of the window to confirm the delete of the item

  props:
  - windowVisibility - state for its visibility on the page
  - onClose - function to close the window on the page
*/

export default function ConfirmationWindow({ windowVisibility, onClose }) {
  return (
    <div
      className={`fixed flex h-screen w-screen items-center justify-center bg-opacity-20 bg-black z-10 ${
        windowVisibility ? "" : "hidden"
      }`}
    >
      <div className="bg-beige border border-darkBeige rounded">
        {/* Header */}
        <div className="border-b border-b-darkBeige">
          <p className="py-8 px-4">Are you sure you want to <span className="text-red font-bold">delete</span>?</p>
        </div>

        {/* Buttons with Border */}
        <div className="flex flex-row justify-between font-bold">
          <button
            className="flex-1 text-center text-red border-r border-darkBeige"
            onClick={onClose}
          >
            <p>Delete</p>
          </button>
          <button
            className="flex-1 text-center"
            onClick={onClose}
          >
            <p className="p-2">Cancel</p>
          </button>
        </div>
      </div>
    </div>
  );
}
