import Header from "../header/header.component";

export default async function PublicLayout({children}:{children:React.ReactNode}) {
  return (
    <>
        <Header/>
        {children}
    </>
  );

}