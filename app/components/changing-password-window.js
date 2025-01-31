import React from "react";

export default function ChangingPasswordWindow({ windowVisibility, onClose }) {
    return (
        <div
            className={`fixed flex h-screen w-screen items-center justify-center bg-opacity-20 bg-black z-10 ${windowVisibility ? "" : "hidden"
                }`}
            data-id="changing-password-window"
        >
            <div className="bg-beige border border-darkBeige rounded">
                {/* Header */}
                <div className="border-b border-b-darkBeige">
                    <p className="py-8 px-4" data-id="changing-password-text">
                        Change Password
                    </p>
                </div>

                {/* Buttons with Border */}
                <div className="flex flex-row justify-between font-bold">
                    <button
                        className="flex-1 text-center text-red border-r border-darkBeige"
                        onClick={onClose}
                    >
                        <p>Change</p>
                    </button>
                    <button className="flex-1 text-center" onClick={onClose}>
                        <p className="p-2">Cancel</p>
                    </button>
                </div>
            </div>
        </div>
    );
}