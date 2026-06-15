import React from 'react';
import './Nav.css';
import { FaPlus, FaCalendarAlt, FaBell, FaDownload } from "react-icons/fa";
import { Link, useLocation } from 'react-router-dom';

function Nav({ handleExportCropList, handleExportCalendar, notificationCount, onBellClick }) {
  const location = useLocation();

  const onExportClick = () => {
    if (location.pathname === "/calendarView" && handleExportCalendar) {
      handleExportCalendar();
    } else if (location.pathname === "/cropList" && handleExportCropList) {
      handleExportCropList();
    }
  };

  return (
    <div>
      <ul className='cropList-ul'>
        <li className='cropList-ll' title="Add Crop">
          <Link to="/addCrop" className="active cropList-a">
            <FaPlus className="nav-icon" />
          </Link>
        </li>

        <li className='cropList-ll' title="Calendar View">
          <Link to="/calendarView" className="active cropList-a">
            <FaCalendarAlt className="nav-icon" />
          </Link>
        </li>

        <li className='cropList-ll notification-icon' title="Notifications">
          <span onClick={onBellClick} className="active cropList-a">
            <FaBell className="nav-icon" />
            {notificationCount > 0 && <span className="red-dot"></span>}
          </span>
        </li>

        <li className='cropList-ll' title="Export">
          <span onClick={onExportClick} className="active cropList-a">
            <FaDownload className="nav-icon" />
          </span>
        </li>
      </ul>
    </div>
  );
}

export default Nav;
