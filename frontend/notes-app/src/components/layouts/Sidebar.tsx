import { useState } from "react";
import { getDeterministicColor } from "@/lib/utils"; // Import utils
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

function Sidebar() {
  const [activeItem, setActiveItem] = useState("All Notes");

  const navItems = [
    { name: "All Notes", icon: DescriptionRoundedIcon },
    { name: "Favorites", icon: StarRoundedIcon },
    { name: "Recent", icon: WatchLaterRoundedIcon },
    { name: "Trash", icon: DeleteRoundedIcon },
  ];

  const categories = ["Personal", "Work", "Ideas", "Projects"];

  return (
    <div className="w-full h-screen flex gap-4">
      <div className="hidden md:flex flex-col w-[280px] h-full border-r border-white/5 bg-[#111a22] shrink-0 p-4 justify-start gap-10">
        <div className="w-full justify-between items-center gap-3 inline-flex">
          <div className="absolute w-10 h-10 bg-sky-100 border-2 border-solid border-sky-600 flex justify-center items-center rounded-full">
            <img
              src="https://pagedone.io/asset/uploads/1704277384.png"
              alt="Bordered rounded avatar"
            />
            <span className="bottom-0 left-7 absolute  w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="relative flex flex-col items-start pl-14">
            <span className="text-white text-base font-semibold leading-tight line-clamp-1">
              Muhammad Talha Yaseen
            </span>
            <span className="text-text-secondary text-xs font-medium">
              @oyeeTalha
            </span>
          </div>
        </div>
        <div className="w-full">
          <ul className="flex-col gap-1 flex">
            {navItems.map((item) => (
              <li key={item.name}>
                <a href="javascript:;" onClick={() => setActiveItem(item.name)}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all ${
                      activeItem === item.name
                        ? "bg-primary/10 text-primary"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="h-5 gap-3 flex">
                      <div
                        className={`flex items-center justify-center ${
                          activeItem === item.name
                            ? "text-primary"
                            : "text-white"
                        }`}
                      >
                        <item.icon sx={{ fontSize: 20 }} />
                      </div>
                      <h2 className="text-sm font-medium leading-snug">
                        {item.name}
                      </h2>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories Section */}
        <div className="w-full flex-col flex flex-1 overflow-y-auto min-h-0">
          <div className="h-8 px-3 items-center inline-flex shrink-0">
            <h6 className="text-gray-500 text-xs font-bold leading-4 tracking-wider">
              CATEGORIES
            </h6>
          </div>
          <ul className="flex-col gap-1 flex">
            {categories.map((category, index) => (
              <li key={category}>
                <a href="javascript:;" onClick={() => setActiveItem(category)}>
                  <div
                    className={`flex items-center gap-1 px-3 py-2.5 rounded-lg group transition-all ${
                      activeItem === category
                        ? "bg-primary/10 text-primary"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="h-5 gap-3 flex items-center w-full">
                      <div className="flex items-center justify-center">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: getDeterministicColor(index),
                          }}
                        ></span>
                      </div>
                      <h2
                        className={`text-sm font-medium leading-snug ${
                          activeItem === category
                            ? "text-primary"
                            : "text-gray-400 group-hover:text-white"
                        }`}
                      >
                        {category}
                      </h2>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full flex-col flex border-t border-white/5 mt-auto">
          <ul className="flex-col gap-1 flex">
            <li>
              <a href="javascript:;">
                <div className="p-3 rounded-lg items-center inline-flex">
                  <div className="h-5 items-center gap-3 flex">
                    <div className="flex items-center justify-center text-primary ">
                      <SettingsRoundedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <h2 className="text-gray-500 text-sm font-medium leading-snug">
                      Settings
                    </h2>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <a href="javascript:;">
                <div className="p-3 rounded-lg items-center inline-flex">
                  <div className="h-5 items-center gap-3 flex">
                    <div className="flex items-center justify-center text-primary ">
                      <LogoutRoundedIcon sx={{ fontSize: 20 }} />
                    </div>
                    <h2 className="text-gray-500 text-sm font-medium leading-snug">
                      Logout
                    </h2>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
