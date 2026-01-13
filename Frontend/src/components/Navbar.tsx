import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 md:px-24 py-4 bg-white sticky top-0 z-[1000]">
      {/* Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate("/")}
      >
        <div className="flex items-end gap-[2px]">
          <div className="w-3 h-5 bg-blue-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
          <div className="w-3 h-7 bg-blue-600 rounded-sm"></div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Boardify</h1>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/signup")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate("/login")}
          className="bg-gray-100 text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Log In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

