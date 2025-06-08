import { Link } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

function Navbar() {
  return (
    <nav className="w-full flex items-center px-8 py-4 shadow relative z-20">
      {/* Left: Home Link (logo/name) */}
      <Link to="/" className="text-xl font-bold">
        Shriyan Sai
      </Link>
      {/* Middle: Menu */}
      <div className="flex-1 flex justify-center space-x-6">
        <Link to="/" className="">Home</Link>
        <Link to="/about" className="">About</Link>
        <Link to="/projects" className="">Projects</Link>
        <Link to="/contact" className="">Contact</Link>
      </div>
      {/* Right: Toggle */}
      <div className="flex items-center">
        <DarkModeToggle />
      </div>
    </nav>
  );
}
export default Navbar;




