import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center">
      <div className="flex items-center justify-start flex-1">
        <img className=" w-30" src="/logo.png" alt="logo" />
        <h1 className="text-5xl font-bold ml-2">Foto Flow</h1>
      </div>
      <ul className="flex items-center justify-center gap-6 flex-1 cursor-pointer">
        <li className=" text-xl ">
          <Link to="/media">MEDIA</Link>
        </li>
        <li className=" text-xl ">
          <Link to="/photo">PHOTO</Link>
        </li>
        <li className=" text-xl ">
          <Link to="/video">VIDEO</Link>
        </li>
        <li className=" text-xl ">
          <Link to="/album">ALBUM</Link>
        </li>
        <li className=" text-xl ">
          <Link to="/people">PEOPLE</Link>
        </li>
        <li className=" text-xl ">
          <Link to="/bin">BIN</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
