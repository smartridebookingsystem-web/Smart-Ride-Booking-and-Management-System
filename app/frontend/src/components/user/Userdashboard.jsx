import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "../rider/Sidebar";
import "../rider/Sidebar.css";
import Home5 from "../../Auth/Home";

export default function Userdashboard() {
  return (
    <div style={{display:"flex"}}>
    
          <Sidebar/>
    
          <div style={{
          // marginLeft:"260px",
         // width:"calc(100% - 260px)"
          }}>
            <Home5/>
    </div>

</div>
  );
}
