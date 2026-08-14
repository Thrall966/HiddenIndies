import { Link } from "react-router-dom";

// site footer, shows on every page
function Footer() {
  return (
    <div className="border-t border-[#ececea] bg-white px-6 py-4 mt-8">
      <div className="flex items-center justify-center gap-5 text-xs text-[#6b6b63]">
        <Link to="/contact" className="hover:text-[#2b2b2b]">
          Contact us
        </Link>
        <Link to="/terms" className="hover:text-[#2b2b2b]">
          Terms of Service
        </Link>
        <Link to="/privacy" className="hover:text-[#2b2b2b]">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}

export default Footer;