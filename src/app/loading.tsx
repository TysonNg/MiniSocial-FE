import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Loading() {
  return(
  <div className="w-full h-[100vh] flex items-center justify-center bg-white text-black">
    <FontAwesomeIcon icon={faSpinner} className="animate-spin w-7 h-7" />
  </div>
  )
}

export function BtnLoading() {
  return (
    <div>
      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
    </div>
  );
}
