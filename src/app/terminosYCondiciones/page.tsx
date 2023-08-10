const TerminosYCondicionesPage = () => {
  return (
    <>
      <main>
        <div className="relative overflow-hidden bg-white py-16">
          <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-prose text-lg">
              <h1>
                <span className="block text-center text-lg font-semibold text-primary-600">
                  imSoft
                </span>
                <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  Términos y Condiciones
                </span>
              </h1>
            </div>
            <div className="prose prose-lg prose-indigo max-w-screen-lg mx-auto mt-6 text-gray-500">
              <ul>
                <li>
                  Se cobrará la mitad del precio total al inicio del proyecto y
                  la otra mitad se cobrará al finalizar el proyecto, una vez
                  realizado este último pago el sitio web quedará público.
                </li>
                <li>
                  El tiempo del proyecto inicia cuando se realice el primer
                  pago.
                </li>
                <li>
                  Si se desea agregar una función no especificada en el
                  documento, se hará una modificación tanto en el precio como en
                  el tiempo del desarrollo.
                </li>
                <li>
                  Todos los textos, traducciones e imágenes deben ser provistos
                  por el cliente, en caso de no contar con textos e imágenes
                  imSoft puede proporcionar esa información con un costo extra.
                </li>
                <li>
                  Se cobrará una cuota anual para el dominio y el hosting
                  dependiendo del servicio contratado.
                </li>
                <li>
                  Se colocará el logo de imSoft que llevará al sitio web oficial
                  del mismo en la última sección del sitio web.
                </li>
                <li>
                  El cliente puede solicitar un máximo de tres cambios en el
                  proyecto, los cuales deben ser solicitados por escrito. Los
                  cambios solicitados que excedan el límite de tres cambios
                  podrían implicar costos adicionales y/o retrasos en el
                  proyecto.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default TerminosYCondicionesPage;
