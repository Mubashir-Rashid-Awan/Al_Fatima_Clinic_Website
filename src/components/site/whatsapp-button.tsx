import Link from "next/link";

const WHATSAPP_ICON_PATH =
  "M16.001 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.258.593 4.464 1.72 6.404L3.2 28.8l6.56-1.685a12.74 12.74 0 0 0 6.24 1.605h.006c7.06 0 12.8-5.74 12.8-12.8s-5.74-12.72-12.805-12.72Zm7.51 18.156c-.32.9-1.585 1.646-2.593 1.862-.69.146-1.59.263-4.62-.994-3.878-1.606-6.375-5.545-6.57-5.803-.187-.257-1.573-2.093-1.573-3.994 0-1.9 1-2.833 1.352-3.222.32-.352.7-.44.933-.44.234 0 .467.002.671.012.215.01.503-.082.787.6.3.72 1.02 2.489 1.108 2.67.09.18.15.393.03.63-.12.24-.18.39-.36.6-.18.21-.378.47-.54.63-.18.18-.368.375-.158.735.21.36.933 1.54 2.004 2.494 1.377 1.227 2.538 1.607 2.9 1.787.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.1.99 2.46 1.17.36.18.6.27.69.42.09.15.09.87-.23 1.77Z";

export function WhatsAppButton({ phoneNumber }: { phoneNumber: string }) {
  // phoneNumber should be in international format without "+", e.g. "923001234567"
  const href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    "Hi, I'd like to ask about booking an appointment."
  )}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d={WHATSAPP_ICON_PATH} />
      </svg>
    </Link>
  );
}
