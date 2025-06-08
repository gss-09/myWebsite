function Contact() {
  return (
    <section className="py-16 px-4 text-center transition-colors duration-500">
      <h2 className="text-3xl font-bold mb-4">Contact</h2>
      <div className="flex flex-col gap-4 items-center">
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
    </section>
  );
}
export default Contact;

