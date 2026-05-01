import React from "react";

function Home() {
  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 transition-colors duration-500">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto">

        {/* Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-14">
          <img
            src="/photo.jpg"
            alt="Shriyans Sai"
            className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl object-cover shadow-lg border border-gray-200 dark:border-gray-700 flex-shrink-0"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">
              Hi, I'm{" "}
              <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Shriyans Sai
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              CS Junior at the University of Houston &mdash; building things at the intersection of AI, machine learning, and software engineering.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">About Me</h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            I'm a junior studying Computer Science at the University of Houston with a focus on AI and machine learning.
            I enjoy building everything from full-stack web apps to data science pipelines, and I'm currently doing
            undergraduate research on adapting world-model architectures for time series prediction.
          </p>
        </div>

        {/* Resume */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Resume</h2>
          <div
            className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700"
            onMouseEnter={() => window.dispatchEvent(new Event("cursorhide"))}
            onMouseLeave={() => window.dispatchEvent(new Event("cursorshow"))}
          >
            <iframe
              src="/resume.pdf"
              title="Shriyans Sai Resume"
              className="w-full"
              style={{ height: "780px" }}
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href="/resume.pdf"
              download
              className="inline-block px-6 py-2 rounded-lg font-semibold
                bg-black text-white dark:bg-white dark:text-black
                transition-opacity duration-200 hover:opacity-75"
            >
              Download Resume
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Home;
