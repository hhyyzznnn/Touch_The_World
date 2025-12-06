import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center h-16 sm:h-24">
      <Image
        src="/ttw_logo.png"
        alt="Touch The World"
        width={0}
        height={0}
        sizes="100vw"
        className="h-full w-auto object-contain"
        priority
      />
    </Link>
  );
}

