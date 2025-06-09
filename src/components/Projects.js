function Projects() {
  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 text-center">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-3xl font-bold mb-4">Projects</h2>
        <div className="flex flex-col gap-6 items-center">
          <div className="p-4 sm:p-6 rounded shadow w-full max-w-xs sm:max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Local RAG Voice Chatbot</h3>
            <p className="text-sm sm:text-base">
              Voice-enabled AI chatbot using Gemma, FAISS, Flask, and Ollama.
            </p>
          </div>
          {/* Add more projects here */}
        </div>
      </div>
    </section>
  );
}
export default Projects;


