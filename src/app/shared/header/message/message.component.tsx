'use client'
import {  faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const handleNotify = () => {
    alert(`System hasn't updated yet`)
}
export function MessageComponent() {
  return (
    <div className="w-10 h-10 rounded-full border-1 border-[var(--base-button-background)] p-5 flex items-center justify-center bg-[var(--base-button-background)] cursor-pointer" onClick={handleNotify}>
    <FontAwesomeIcon icon={faMessage} className="text-xl" />
  </div>
  );
}
