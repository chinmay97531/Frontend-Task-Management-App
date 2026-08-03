import React, { useState } from "react";

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Shows a profile photo when available, otherwise initials.
 */
export function UserAvatar({
  src,
  name = "",
  size = "md",
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
        ? "h-11 w-11 text-sm"
        : "h-9 w-9 text-[11px]";

  if (showImage) {
    return (
      <img
        src={src}
        alt={name || "User"}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-teal-400/40 ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizeClass} shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-teal-400/80 to-violet-500/80 font-bold text-white shadow-sm ring-2 ring-white/15 ${className}`}
      aria-hidden={!name}
      title={name || undefined}
    >
      {getInitials(name)}
    </span>
  );
}
