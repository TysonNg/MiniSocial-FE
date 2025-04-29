import { faTableCellsLarge } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="text-center h-[100vh] flex flex-col justify-center gap-3">
      <p className="font-bold text-5xl mb-10">404 Not Found</p>
      <Link href="/" className="w-[200px] self-center-safe">
        <button className="border-1 w-[200px] self-center-safe p-2 cursor-pointer hover:bg-amber-50 hover:text-black font-bold transition-colors duration-300">
          Go to Homepage
        </button>
      </Link>
    </div>
  );
}


export function NotHavePosts(){
  return(
    <div className="text-center h-100 flex flex-col justify-center gap-3">
      <div>
        <FontAwesomeIcon  icon={faTableCellsLarge} className="text-[var(--foreground-subTitle)]" size="5x"/>
      </div>
      <div className="text-2xl font-bold">
        There are no post yet
      </div>
    </div>
  )
}