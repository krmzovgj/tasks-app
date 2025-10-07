import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    className?: string; // additional styles
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    className = "",
    ...props
}) => {
    return (
        <div className={`flex  flex-col ${className}`}>
            {label && (
                <label className="mb-1 mt-5 font-medium text-foeground/80">
                    {label}
                </label>
            )}
            <input
                {...props}
                className={`border rounded-2xl transition-all px-4 py-3 focus:outline-none focus:ring-2 focus:ring-foreground 
                    ${error ? "border-red-500" : "border-gray-300"}`}
            />
        </div>
    );
};

export default Input;
