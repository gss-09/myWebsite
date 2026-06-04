import { lines } from "./lines";

const links = [
  { lbl: "email", text: "shriyansai73@gmail.com", href: "mailto:shriyansai73@gmail.com", ext: false },
  { lbl: "github", text: "github.com/gss-09", href: "https://github.com/gss-09", ext: true },
  { lbl: "linkedin", text: "in/shriyans-sai", href: "https://www.linkedin.com/in/shriyans-sai/", ext: true },
  { lbl: "instagram", text: "@shriyans_sai09", href: "https://www.instagram.com/shriyans_sai09/", ext: true },
];

export default function Contact() {
  return (
    <section className="section" id="contact" data-lines={lines(16)}>
      <div className="ps1">
        <b>shriyans</b>@<b>portfolio</b> <span className="amber">~</span>
      </div>
      <div className="cmd">./contact --connect</div>
      {links.map((l) => (
        <div className="out" key={l.lbl}>
          <span className="arrow">→</span>
          <span className="lbl">{l.lbl}</span>
          <a
            href={l.href}
            {...(l.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {l.text}
          </a>
        </div>
      ))}
    </section>
  );
}
