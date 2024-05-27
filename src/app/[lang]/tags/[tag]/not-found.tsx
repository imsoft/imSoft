import Link from "next/link";

export const NotFound = () => {
  return (
    <div className="text-center">
      <p className="mt-10">Lo sentimos el post que solicitaste no existe.</p>
      <Link href="/">Regresar al inicio de la página</Link>
    </div>
  );
};

export default NotFound;
