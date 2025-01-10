"use client";
import React, { useEffect, useRef, useState } from "react";
type Message = {
  id: number;
  type: "bot" | "user";
  text: React.ReactNode; // cuando se devuelve elementos de react se sua este tipo
};

const API_KEY = "LJQHz4w6b37gwK2RkR5nSjIg9F8crhagA84IZDnr";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      text: "Hola, Soy un bot preparado apra contestar algunas preguntas sobre patricio avila",
    },

  ]);

  const ANSWERS = {
    intro: (
      <p>Hola soy (patricio avila)</p>
    ),
    comunidad: (
      <p>soy la comunidad</p>
    ),
    unknown: (
      <p>soy unkonwn</p>
    ),
    contacto: (
      <p>Ssoy contacto </p>
    )
  };

  const EXAMPLES = [
    // Intro ejemplos
    { text: "Hola!", label: "intro" },
    { text: "¿Qué haces actualmente?", label: "intro" },
  
    // Comunidad ejemplos
    { text: "¿Qué herramientas de desarrollo usas?", label: "comunidad" },
    { text: "¿Qué bases de datos has usado?", label: "comunidad" },
  
    // Contacto ejemplos
    { text: "¿Dónde vives?", label: "contacto" },
    { text: "¿Cómo puedo contactarte?", label: "contacto" },
  
    // Unknown ejemplos
    { text: "¿Eres el dios de los programadores?", label: "unknown" },
    { text: "¿Cuál es el peor enemigo de un programador?", label: "unknown" },
  ];
  
  const [question, SetQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  //  Para el scroll del chat
  const container = useRef<HTMLDivElement>(null);

  // Manejando los mensajes para enviar y recibir
  async function HandleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    if (loading) return; // Evita que se envie la misma pregunta muchas  veces
    setLoading(true);

    // Agregando el mensaje del usuario al chat
    setMessages((messages) =>
      messages.concat({ id: Date.now(), type: "user", text: question })
    );

    SetQuestion(""); // Limpia la pregunta

    const { classifications } = await fetch(
      "https://api.cohere.ai/v1/classify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "embed-english-v3.0",
          inputs: [question],
          examples: EXAMPLES,
        }),
      }
    ).then((res) => res.json());
    
    // Mostrar clasificación en consola
    console.log("Clasificación:", classifications);
    
    // Mensaje del bot
    const prediction = classifications[0]?.prediction as keyof typeof ANSWERS;
    setMessages((messages) =>
      messages.concat({
        id: Date.now(),
        type: "bot",
        text: ANSWERS[prediction] || ANSWERS["unknown"],
      })
    );
    
    
    setLoading(false);

    // console.log(classifications);
  }

  // use useEffect para controlar el chat y baja el scroll hacia abajo
  useEffect(() => {
    container.current?.scroll({ top: container.current.scrollHeight });
  })


  return (
    <main className="p-4 flex justify-center items-center min-h-screen bg-gray-800 ">
      <div className="flex flex-col gap-4 m-auto max-w-lg border border-gray-300 p-4 rounded-md shadow-md bg-white">
        {/* Mensajes */}
        <div ref={container} className="flex flex-col gap-4 h-[300px] overflow-y-auto over-flow-x-hidden">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 max-w-[80%] rounded-3xl text-white ${
                message.type === "bot"
                  ? "bg-slate-500 text-left self-start rounded-bl-none"
                  : "bg-blue-500 text-right self-end rounded-br-none"
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>

        {/* Formulario */}
        <form className="flex items-center gap-2" onSubmit={HandleSubmit}>
          <input
            value={question}
            onChange={(e) => SetQuestion(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:ring-blue-200"
            type="text"
            placeholder="Escribe tu mensaje..."
            name="question"
          />
          <button
            className={`px-4 py-2 border border-gray-300 rounded-r-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200 ${
              loading && "cursor-not-allowed"
            }`}
            disabled={loading}
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
