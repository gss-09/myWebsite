import React from "react";

export default function SectionHeading({ index, title, subtitle }) {
  return (
    <div className="mb-8 sm:mb-10 text-center">
      <div className="text-[11px] sm:text-xs font-mono tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-2 uppercase">
        {String(index).padStart(2, "0")} <span className="opacity-50">/</span> {title}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
