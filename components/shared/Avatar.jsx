import Image from "next/image";

export default function Avatar({ src, name, size = 40, className = "" }) {
  const initials = name ? name.charAt(0).toUpperCase() : "?";
  if (src) {
    return (
      <Image
        src={src}
        alt={name || "avatar"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
