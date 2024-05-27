"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { sendEmail } from "@/lib";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  name: string;
  email: string;
  phone: string;
  message: string;
  errorInputName: string;
  errorInputEmail: string;
  errorInputPhone: string;
  errorInputMessage: string;
  send: string;
}

export const ContactForm = ({
  name,
  email,
  phone,
  message,
  errorInputName,
  errorInputEmail,
  errorInputPhone,
  errorInputMessage,
  send,
}: Props) => {
  const router = useRouter();

  const [inputName, setInputName] = useState("");
  const [inputEMail, setInputEMail] = useState("");
  const [inputPhoneNumber, setInputPhoneNumber] = useState("");
  const [inputMessage, setInputMessage] = useState("");

  const [touchedName, setTouchedName] = useState(false);
  const [touchedEMail, setTouchedEMail] = useState(false);
  const [touchedPhoneNumber, setTouchedPhoneNumber] = useState(false);
  const [touchedMessage, setTouchedMessage] = useState(false);

  const onTextFieldChangedName = (event: ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
  };

  const onTextFieldChangedEMail = (event: ChangeEvent<HTMLInputElement>) => {
    setInputEMail(event.target.value);
  };

  const onTextFieldChangedPhoneNumber = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setInputPhoneNumber(event.target.value);
  };

  const onTextFieldChangedMessage = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInputMessage(event.target.value);
  };

  const onSend = async () => {
    inputName.length === 0 ? setTouchedName(true) : setTouchedName(false);
    inputEMail.length === 0 ? setTouchedEMail(true) : setTouchedEMail(false);
    inputPhoneNumber.length === 0
      ? setTouchedPhoneNumber(true)
      : setTouchedPhoneNumber(false);
    inputMessage.length === 0
      ? setTouchedMessage(true)
      : setTouchedMessage(false);

    if (
      inputName.length > 0 &&
      inputEMail.length > 0 &&
      inputPhoneNumber.length > 0 &&
      inputMessage.length > 0
    ) {
      try {
        await sendEmail(inputName, inputEMail, inputPhoneNumber, inputMessage);
      } catch (error) {
        console.warn(error);
        router.push("/mensajes/mensajeDeError");
        throw new Error("Hubo un error al enviar tu mensaje...");
      }

      setInputName("");
      setInputEMail("");
      setInputPhoneNumber("");
      setInputMessage("");
      router.push("/mensajes/mensajeDeConfirmacion");
    }
  };

  return (
    <>
      <form className="grid grid-cols-1 gap-y-6" method="post">
        <div className="relative mt-1 rounded-md shadow-sm">
          <label htmlFor="full-name" className="sr-only">
            {name}
          </label>
          <input
            type="text"
            name="full-name"
            id="full-name"
            autoComplete="name"
            className="block w-full rounded-md border-gray-300 py-3 px-4 placeholder-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder={name}
            onChange={onTextFieldChangedName}
            onBlur={() => setTouchedName(true)}
          />
          {!inputName && touchedName && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {!inputName && touchedName && (
          <p className="-mt-4 ml-4 text-sm text-red-600" id="email-error">
            {errorInputName}
          </p>
        )}

        <div className="relative mt-1 rounded-md shadow-sm">
          <label htmlFor="email" className="sr-only">
            {email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="block w-full rounded-md border-gray-300 py-3 px-4 placeholder-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder={email}
            onChange={onTextFieldChangedEMail}
            onBlur={() => setTouchedEMail(true)}
          />
          {!inputEMail && touchedEMail && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {!inputEMail && touchedEMail && (
          <p className="-mt-4 ml-4 text-sm text-red-600" id="email-error">
            {errorInputEmail}
          </p>
        )}

        <div className="relative mt-1 rounded-md shadow-sm">
          <label htmlFor="phone" className="sr-only">
            {phone}
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            autoComplete="tel"
            className="block w-full rounded-md border-gray-300 py-3 px-4 placeholder-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder={phone}
            onChange={onTextFieldChangedPhoneNumber}
            onBlur={() => setTouchedPhoneNumber(true)}
          />
          {!inputPhoneNumber && touchedPhoneNumber && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {!inputPhoneNumber && touchedPhoneNumber && (
          <p className="-mt-4 ml-4 text-sm text-red-600" id="email-error">
            {errorInputPhone}
          </p>
        )}

        <div className="relative mt-1 rounded-md shadow-sm">
          <label htmlFor="message" className="sr-only">
            {message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="block w-full rounded-md border-gray-300 py-3 px-4 placeholder-gray-500 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder={message}
            defaultValue={""}
            onChange={onTextFieldChangedMessage}
            onBlur={() => setTouchedMessage(true)}
          />
          {!inputMessage && touchedMessage && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {!inputMessage && touchedMessage && (
          <p className="-mt-4 ml-4 text-sm text-red-600" id="email-error">
            {errorInputMessage}
          </p>
        )}

        <div>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-500 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={onSend}
          >
            {send}
          </button>
        </div>
      </form>
    </>
  );
};
