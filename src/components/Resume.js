import { lines } from "./lines";

export default function Resume() {
  return (
    <section className="section" id="resume" data-lines={lines(20)}>
      <div className="ps1">
        <b>shriyans</b>@<b>portfolio</b> <span className="amber">~</span>
      </div>
      <div className="cmd">open ./resume.pdf</div>
      <div className="legend">
        rendering document · pdf · press <span className="amber">↓</span> to save
      </div>
      <div className="pdfpane">
        <div className="pdfbar">
          <span className="nm">resume.pdf</span>
          <a href="/resume.pdf" download>
            ↓ download
          </a>
        </div>
        <iframe
          src="/resume.pdf#toolbar=0&navpanes=0&view=FitH"
          title="Shriyans Sai — Resume"
          loading="lazy"
        />
      </div>
    </section>
  );
}
