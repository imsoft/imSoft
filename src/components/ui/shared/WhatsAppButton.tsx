import Image from "next/image";
import Link from "next/link";
import { whatsappBusinessLink } from "@/data";

export const WhatsappButton = () => {
  return (
    <Link href={whatsappBusinessLink} target="_blank">
      <div
        className="fixed bottom-5 right-5 z-50 flex justify-center items-center"
        style={{ width: 80, height: 80 }}
      >
        <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></div>
        <Image
          className="relative"
          src={"/icons/WhatsApp-Icon.svg"}
          alt={"Boton de WhatsApp imSoft"}
          width={80}
          height={80}
        />
      </div>
    </Link>
  );
};
