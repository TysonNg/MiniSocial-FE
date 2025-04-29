"use client";

import searchUserByUsername from "@/app/features/users/data/data";
import useDebounce from "@/app/hooks/useDebounce.hook";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  avatarurl: string;
  name: string;
  id: string;
};

export default function SearchBar() {
  const [name, setName] = useState<string>("");
  const [datas, setDatas] = useState<User[]>([]);

  const debouncedSearchTerm = useDebounce(name, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  useEffect(() => {
      const fetchDataSearch = async () => {
        const result = await searchUserByUsername(debouncedSearchTerm);
        setDatas(result);
        return result;
      };
      fetchDataSearch();
  }, [debouncedSearchTerm]);


  return (
    <div className="col-span-4 w-[630px] relative ml-25 z-1">
      <input
        onChange={handleChange}
        type="text"
        className="border border-[var(--base-button-background)] bg-[var(--color-background)] w-full py-1 pl-2 outline-0 rounded-xl"
        placeholder="🔍 Search for friends, posts and more"
      />
      {datas.length > 0 && (
        <div className="result-container absolute top-10 py-2 bg-white w-full h-fit max-h-[200px] overflow-y-auto rounded-lg shadow-2xl">
          <div className="flex flex-col gap-2 ">
            {datas.map((data) => (
              <Link key={data.id} href={`/${data.id}`}>
                <div className="flex flex-row gap-2 py-2 cursor-pointer hover:bg-black/20">
                  <div className="w-7 h-7 relative rounded-full ml-2">
                    <Image
                      src={data.avatarurl}
                      fill
                      alt="avatar"
                      className="rounded-full"
                    />
                  </div>
                  <p>{data.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
