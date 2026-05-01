import React from "react";

function Home() {
  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 transition-colors duration-500">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Hi, I'm Shriyan Sai</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            CS Junior at the University of Houston &mdash; building things at the intersection of AI, machine learning, and software engineering.
          </p>
        </div>

        {/* About */}
        <div className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">About Me</h2>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
            I'm a junior studying Computer Science at the University of Houston with a focus on AI and machine learning.
            I enjoy building everything from full-stack web apps to data science pipelines.
          </p>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 leading-relaxed mt-4">
            I'm currently doing research under Prof. Sen Lin, adapting <span className="font-semibold">DreamerV3</span> &mdash; a world-model
            reinforcement learning architecture &mdash; to time series forecasting problems and benchmarking it against traditional time series models.
          </p>
        </div>

        {/* Resume */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Resume</h2>
          <div className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
            <iframe
              src="/resume.pdf"
              title="Shriyan Sai Resume"
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
