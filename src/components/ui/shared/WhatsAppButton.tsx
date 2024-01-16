import Image from "next/image";
import Link from "next/link";
import { whatsappBusinessLink } from "@/data";

export const WhatsappButton = () => {
  return (
    <Link href={whatsappBusinessLink} target="_blank">
      <Image
        className="fixed bottom-5 right-5 z-50"
        src={"/icons/WhatsApp-Icon.svg"}
        alt={"Boton de WhatsApp imSoft"}
        width={80}
        height={80}
      />
    </Link>
  );
};
