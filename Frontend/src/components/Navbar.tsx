import "bootstrap/dist/css/bootstrap.min.css";
import { FaRegUserCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <>
     <nav className="d-flex py-3 sm:py-1 bg-secondary align-items-center justify-content-between px-2 px-md-5">
        <h2 className="text-uppercase text-black">CollabBoard</h2>
        <div>
          <FaRegUserCircle size={"30px"} cursor={"pointer"}/>
        </div>
     </nav>
    </>
  );
};

export default Navbar;
