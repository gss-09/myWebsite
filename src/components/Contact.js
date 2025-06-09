function Contact() {
  return (
    <section className="py-10 px-2 sm:py-16 sm:px-4 text-center transition-colors duration-500">
      <div className="max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-3xl font-bold mb-4">Contact</h2>
        <div className="flex flex-col gap-3 sm:gap-4 items-center">
          <a
            href="mailto:shriyansai73@gmail.com"
            className="social-link"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/shriyans-sai/"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://www.instagram.com/shriyans_sai09/"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            href="https://github.com/gss-09"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
export default Contact;

