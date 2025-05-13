/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "./components/Links";

import routes from "../../../routes";

const Sidebar = ({ role,open, onClose }) => {
  return (
    <div
      className={`max-w-72 sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-50 ${
        open ? "translate-x-0" : "-translate-x-96 "
      } `}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[56px] mt-[50px] flex items-center`}>
        <div className="mt-1 ml-1 h-2.5 font-poppins text-[20px] font-bold uppercase text-navy-700 dark:text-white">
          EsPsy<span class="font-medium"> Dashboard</span>
        </div>
      </div>
      <div class="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      {/* Nav item */}

      <ul className="mb-auto pt-1">
      <Links routes={routes.filter((route) => route.role === role || route.role === "allInterface")} />
      </ul>



      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;
