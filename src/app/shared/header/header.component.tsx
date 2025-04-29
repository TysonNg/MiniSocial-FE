import LeftSidebarComponents, {
  RightSidebarComponents,
} from "./sidebar-components";
import SearchBar from "./searchbar.component";
import MyUserComponent from "./myuser/myuser.components";
import Link from "next/link";
import { NotifyComponent } from "./notify/notify.component";
import { MessageComponent } from "./message/message.component";

export default function Header() {
  return (
    <div className="w-full grid grid-cols-12 justify-between items-center bg-white text-black py-2 px-7 shadow-md sticky top-0 z-3">
      <div className="col-span-4 w-[80px] flex flex-row gap-4 z-1 ">
        <LeftSidebarComponents />
       
          <Link href="/home" className="">
            <p className="text-nowrap font-bold">Mini Social</p>
          </Link>
      </div>
      <SearchBar />
      <div className="col-span-4 flex flex-row gap-5 w-full justify-end">
        
        <MessageComponent />
        <NotifyComponent />
        <MyUserComponent />
      </div>
      <RightSidebarComponents />
    </div>
  );
}
