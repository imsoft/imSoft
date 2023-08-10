import { dateMetatagInfo } from "@/data";
import { RequiredMetatags } from "@/interfaces";

const avisoDePrivacidad = () => {
  const metatagsInfo: RequiredMetatags = {
    title: "Aviso de privacidad | imSoft",
    description: "imSoft se preocupa por la privacidad de sus clientes y usuarios, por lo que proteger la información personal es una prioridad para nosotros. Este aviso de privacidad explica cómo recopilamos, usamos y protegemos la información personal que se nos proporciona a través de nuestros productos, servicios, sitios web y aplicaciones móviles",
    keywords: "Aviso de privacidad, imSoft",
    author: "Brandon Uriel García Ramos",
    subject: "Aviso de privacidad",
    date: dateMetatagInfo,
    type: "Aviso de privacidad",
    source: "https://www.imsoft.io/avisoDePrivacidad",
    image: "https://raw.githubusercontent.com/imsoft/BlogPosts/main/images/imsoft/logotipo-imsoft-cuadrado.png",
    url: "https://www.imsoft.io/avisoDePrivacidad",
    robots: "index,follow",
    _id: "",
    tags: []
  };

  return (
    <>
      {/* MetaEtiquetas Básicas */}
      <title>{metatagsInfo.title}</title>
      <meta name="title" content={metatagsInfo.title} />
      <meta httpEquiv="title" content={metatagsInfo.title} />
      <meta name="description" lang="es" content={metatagsInfo.description} />
      <meta name="keywords" lang="es" content={metatagsInfo.keywords} />
      <meta name="date" content={metatagsInfo.date} />

      {/* Informacion del autor */}
      <meta name="author" content={metatagsInfo.author} />

      {/* Dublincore */}
      <meta name="DC.title" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.creator" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.subject" lang="es-MX" content={metatagsInfo.subject} />
      <meta
        name="DC.description"
        lang="es-MX"
        content={metatagsInfo.description}
      />
      <meta name="DC.publisher" lang="es-MX" content={metatagsInfo.author} />
      <meta name="DC.date" lang="es-MX" content={metatagsInfo.date} />
      <meta name="DC.type" lang="es-MX" content={metatagsInfo.type} />
      <meta name="DC.identifier" lang="es-MX" content={metatagsInfo.title} />
      <meta name="DC.source" lang="es-MX" content={metatagsInfo.source} />
      <meta name="DC.relation" lang="es-MX" content={metatagsInfo.source} />

      {/* Twitter */}
      <meta name="twitter:title" content={metatagsInfo.title} />
      <meta name="twitter:description" content={metatagsInfo.description} />
      <meta name="twitter:image:src" content={metatagsInfo.image} />
      <meta name="twitter:image:alt" content={metatagsInfo.title} />

      {/* Facebook */}
      <meta property="og:title" content={metatagsInfo.title} />
      <meta property="og:type" content={metatagsInfo.type} />
      <meta
        property="og:url"
        content={`https://www.imsoft.io${metatagsInfo.url}`}
      />
      <meta property="og:image" content={metatagsInfo.image} />
      <meta property="og:description" content={metatagsInfo.description} />

      {/* Google + / Pinterest */}
      <meta itemProp="description" content={metatagsInfo.description} />
      <meta itemProp="image" content={metatagsInfo.image} />

      {/* Robots */}
      <meta name="robots" content={metatagsInfo.robots} />

      <main>
        <div className="relative overflow-hidden bg-white py-16">
          <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-prose text-lg">
              <h1>
                <span className="block text-center text-lg font-semibold text-primary-600">
                  imSoft
                </span>
                <span className="mt-2 block text-center text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
                  Aviso de privacidad
                </span>
              </h1>
            </div>
            <div className="prose prose-lg prose-indigo max-w-screen-lg mx-auto mt-6 text-gray-500">
              <p>
                Brandon Uriel Garcia Ramos mejor conocido como imSoft, con
                domicilio en Guadalajara, Jalisco, México y portal de internet
                imsoft.io/avisoDePrivacidad, es el responsable del uso y
                protección de sus datos personales, y al respecto le informamos
                lo siguiente:
              </p>
              <h2>
                <strong>
                  ¿Para qué fines utilizaremos sus datos personales?
                </strong>
              </h2>
              <p>
                Los datos personales que recabamos de usted, los utilizaremos
                para las siguientes finalidades que son necesarias para el
                servicio que solicita:
              </p>
              <p>
                Respuesta a mensajes del formulario de contacto, Prestación de
                cualquier servicio solicitado
              </p>
              <h2>
                <strong>
                  ¿Qué datos personales utilizaremos para estos fines?
                </strong>
              </h2>
              <p>
                Para llevar a cabo las finalidades descritas en el presente
                aviso de privacidad, utilizaremos los siguientes datos
                personales:
              </p>
              <p>Datos de identificación y contacto, Datos laborales</p>
              <h2>
                <strong>
                  ¿Cómo puede acceder, rectificar o cancelar sus datos
                  personales, u oponerse a su uso o ejercer la revocación de
                  consentimiento?
                </strong>
              </h2>
              <p>
                Usted tiene derecho a conocer qué datos personales tenemos de
                usted, para qué los utilizamos y las condiciones del uso que les
                damos (Acceso). Asimismo, es su derecho solicitar la corrección
                de su información personal en caso de que esté desactualizada,
                sea inexacta o incompleta (Rectificación); que la eliminemos de
                nuestros registros o bases de datos cuando considere que la
                misma no está siendo utilizada adecuadamente (Cancelación); así
                como oponerse al uso de sus datos personales para fines
                específicos (Oposición). Estos derechos se conocen como derechos
                ARCO.
              </p>
              <p>
                Para el ejercicio de cualquiera de los derechos ARCO, debe
                enviar una petición vía correo electrónico a contacto@imsoft.io
                y deberá contener:
              </p>
              <ul role="list" className="list-disc">
                <li>Nombre completo del titular.</li>
                <li>Domicilio.</li>
                <li>Teléfono.</li>
                <li>Correo electrónico usado en este sitio web.</li>
                <li>Copia de una identificación oficial adjunta.</li>
                <li>Asunto «Derechos ARCO»</li>
              </ul>
              <p>
                Descripción el objeto del escrito, los cuales pueden ser de
                manera enunciativa más no limitativa los siguientes: Revocación
                del consentimiento para tratar sus datos personales; y/o
                Notificación del uso indebido del tratamiento de sus datos
                personales; y/o Ejercitar sus Derechos ARCO, con una descripción
                clara y precisa de los datos a Acceder, Rectificar, Cancelar o
                bien, Oponerse. En caso de Rectificación de datos personales,
                deberá indicar la modificación exacta y anexar la documentación
                soporte; es importante en caso de revocación del consentimiento,
                que tenga en cuenta que no en todos los casos podremos atender
                su solicitud o concluir el uso de forma inmediata, ya que es
                posible que por alguna obligación legal requiramos seguir
                tratando sus datos personales. Asimismo, usted deberá considerar
                que para ciertos fines, la revocación de su consentimiento
                implicará que no le podamos seguir prestando el servicio que nos
                solicitó, o la conclusión de su relación con nosotros.
              </p>
              <h2>
                <strong>
                  ¿En cuántos días le daremos respuesta a su solicitud?
                </strong>
              </h2>
              <p>5 días</p>

              <h2>
                <strong>
                  ¿Por qué medio le comunicaremos la respuesta a su solicitud?
                </strong>
              </h2>
              <p>contacto@imsoft.io</p>
              <h2>
                <strong>
                  El uso de tecnologías de rastreo en nuestro portal de internet
                </strong>
              </h2>
              <p>
                Le informamos que en nuestra página de internet utilizamos
                cookies, web beacons u otras tecnologías, a través de las cuales
                es posible monitorear su comportamiento como usuario de
                internet, así como brindarle un mejor servicio y experiencia al
                navegar en nuestra página. Los datos personales que obtenemos de
                estas tecnologías de rastreo son los siguientes:
              </p>
              <p>
                Idioma preferido por el usuario, Región en la que se encuentra
                el usuario, Tipo de navegador del usuario, Tipo de sistema
                operativo del usuario, Páginas web visitadas por un usuario
              </p>
              <p>
                Estas cookies, web beacons y otras tecnologías pueden ser
                deshabilitadas. Para conocer cómo hacerlo, consulte el menú de
                ayuda de su navegador. Tenga en cuenta que, en caso de
                desactivar las cookies, es posible que no pueda acceder a
                ciertas funciones personalizadas en nuestros sitio web.
              </p>
              <h2>
                <strong>
                  ¿Cómo puede conocer los cambios en este aviso de privacidad?
                </strong>
              </h2>
              <p>
                El presente aviso de privacidad puede sufrir modificaciones,
                cambios o actualizaciones derivadas de nuevos requerimientos
                legales; de nuestras propias necesidades por los productos o
                servicios que ofrecemos; de nuestras prácticas de privacidad; de
                cambios en nuestro modelo de negocio, o por otras causas. Nos
                comprometemos a mantener actualizado este aviso de privacidad
                sobre los cambios que pueda sufrir y siempre podrá consultar las
                actualizaciones que existan en el sitio web
                imsoft.io/avisoDePrivacidad.
              </p>
              <p>
                Última actualización de este aviso de privacidad: 29/01/2023
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default avisoDePrivacidad;
