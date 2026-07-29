import {
  FaHome,
  FaSearch,
  FaCar,
  FaHistory,
  FaTicketAlt,
  FaWallet,
  FaCreditCard,
  FaBell,
  FaQuestionCircle,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";

import "./Sidebar.css";

export default function Sidebar() {

  const menu = [
    {name:"Dashboard",icon:<FaHome/>},
    {name:"Search Ride",icon:<FaSearch/>},
    {name:"Book Ride",icon:<FaCar/>},
    {name:"Ride History",icon:<FaHistory/>},
    {name:"My Bookings",icon:<FaTicketAlt/>},
    {name:"Wallet",icon:<FaWallet/>},
    {name:"Payment Methods",icon:<FaCreditCard/>},
    {name:"Notifications",icon:<FaBell/>},
    {name:"Help & Support",icon:<FaQuestionCircle/>},
    {name:"Settings",icon:<FaCog/>},
  ];

  return (

<div className="sidebar">

<div className="logo">
🚕 <span>SmartRide</span>
</div>

<div className="menu">

{
menu.map((item,index)=>(
<div
key={index}
className={`menu-item ${index===0?"active":""}`}
>

{item.icon}

<span>{item.name}</span>

</div>
))
}

</div>

<div className="logout">

<FaSignOutAlt/>

<span>Logout</span>

</div>

</div>

  );
}