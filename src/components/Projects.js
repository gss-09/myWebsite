function Projects() {
  return (
    <section className="py-16 px-4 text-center">
      <h2 className="text-3xl font-bold mb-4">Projects</h2>
      <div className="flex flex-col gap-6 items-center">
        <div className="p-6 rounded shadow w-full max-w-md">
          <h3 className="text-xl font-semibold mb-2">Local RAG Voice Chatbot</h3>
          <p>Voice-enabled AI chatbot using Gemma, FAISS, Flask, and Ollama.</p>
        </div>
        {/* Add more projects here */}
      </div>
    </section>
  );
}
export default Projects;


