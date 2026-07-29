import Sidebar from "../components/Sidebar";

export default function DashboardLayout({children}){

return(

<div style={{display:"flex"}}>

<Sidebar/>

<div
style={{
marginLeft:"260px",
width:"calc(100% - 260px)"
}}
>

{children}

</div>

</div>

);

}