import Image from "next/image";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <div className="flex flex-row content-between">
        <div className="leftSide relative w-1/2 h-[100vh]">
          <Image
            src="https://cdn.pixabay.com/photo/2025/04/08/10/42/landscape-9521261_1280.jpg"
            alt="img"
            fill
            className="object-cover"
          />
        </div>
        <div className="rightSide w-1/2 bg-white text-black text-center ">
            {children}
        </div>
      </div>
    </section>
  );
}
