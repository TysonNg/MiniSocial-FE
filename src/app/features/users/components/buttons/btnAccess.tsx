import { BtnLoading } from "@/app/loading";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
// import { SignOutAction } from "../../actions/access.action";
// import { redirect } from "next/navigation";

export default function BtnLogin({ loading }: { loading: boolean }) {
  return (
    <div>
      <button
        type="submit"
        className="mt-20  w-1/3 p-3 rounded-2xl bg-[var(--background-btnAccess)] text-white text-xl font-semibold shadow-lg cursor-pointer"
      >
        {loading && <BtnLoading />}
        {!loading && <span>Login</span>}
      </button>
    </div>
  );
}

export function BtnSignUp({ loading }: { loading: boolean }) {
  return (
    <div>
      <button
        type="submit"
        className="mt-20  w-1/3 p-3 rounded-2xl bg-[var(--background-btnAccess)] text-white text-xl font-semibold shadow-lg cursor-pointer"
      >
        {loading && <BtnLoading />}
        {!loading && <span>Register</span>}
      </button>
    </div>
  );
}

// export function BtnLogout() {
  
//   return (
//     <li className="flex flex-row items-center gap-2 hover:bg-[#f0f0f0] cursor-pointer rounded-md p-1" onClick={handleLogout}>
//       <div className="bg-[#e3e5e9] p-1 rounded-full">
//         <span>
//           <FontAwesomeIcon icon={faRightFromBracket} className="h-7 w-7" />
//         </span>
//       </div>
//       <p>Sign out</p>
//     </li>
//   );
// }
