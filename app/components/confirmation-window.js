import React from "react";

/*
  ConfirmationWindow - component of the window to confirm the delete of the item

  props:
  - windowVisibility - state for its visibility on the page
  - onClose - function to close the window on the page
  -- onDelete - function to delete
*/

export default function ConfirmationWindow({
  windowVisibility,
  onClose,
  onDelete,
}) {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 ${
        windowVisibility ? "opacity-100 visible" : "opacity-0 invisible"
      } transition-opacity duration-300 ease-in-out`}
      data-id="confirmation-window"
    >
      <div className="bg-beige border border-darkBeige rounded">
        {/* Header */}
        <div className="border-b border-b-darkBeige">
          <p className="py-8 px-4" data-id="confirmation-text">
            Are you sure you want to{" "}
            <span className="text-red font-bold">delete</span>?
          </p>
        </div>

        {/* Buttons with Border */}
        <div className="flex flex-row justify-between font-bold">
          <button
            className="flex-1 text-center text-red border-r border-darkBeige"
            onClick={onDelete}
            type="button"
            data-id="confirm-delete-button"
          >
            <p>Delete</p>
          </button>
          <button
            className="flex-1 text-center"
            onClick={onClose}
            type="button"
          >
            <p className="p-2">Cancel</p>
          </button>
        </div>
      </div>
    </div>
  );
}
