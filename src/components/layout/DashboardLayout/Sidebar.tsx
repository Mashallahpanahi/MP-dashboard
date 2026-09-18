// src/components/layout/Sidebar/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguageStore } from "@store/languageStore";
import {
  FaHome,
  FaUsers,
  FaUserGraduate,
  FaBook,
  FaChalkboardTeacher,
  FaCog,
  FaBars,
  FaChevronRight,
  FaChevronLeft,
  FaUserPlus,
  FaMoneyBillWave,
  FaUserCheck,
  FaStickyNote,
  FaChevronDown,
  FaChevronUp,
  FaCreditCard,
  FaWallet,
  FaReceipt,
  FaClipboardList,
  FaPrint,
} from "react-icons/fa";
import { TbDatabaseHeart } from "react-icons/tb";

const Sidebar = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const location = useLocation();
  const isRtl = language === "fa";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/teachers")) setExpandedMenu("teachers");
    else if (path.startsWith("/students")) setExpandedMenu("students");
    else if (path.startsWith("/books")) setExpandedMenu("books");
    else if (path.startsWith("/classes")) setExpandedMenu("classes");
    else if (path.startsWith("/payment")) setExpandedMenu("payment");
    else if (path.startsWith("/notes")) setExpandedMenu("notes");
  }, [location.pathname]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMenu = (menuId: string) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const isSubItemActive = (subPaths: string[]) => {
    return subPaths.some((path) => location.pathname.startsWith(path));
  };

  const navItems = [
    { path: "/", label: "sidebar.home", icon: <FaHome /> },

    {
      label: "sidebar.books",
      icon: <FaBook />,
      menuId: "books",
      subItems: [
        { path: "/books/add", label: "sidebar.addBook", icon: <FaUserPlus /> },
        {
          path: "/books/all",
          label: "sidebar.allBooks",
          icon: <FaUserCheck />,
        },
      ],
    },
    {
      label: "sidebar.teachers",
      icon: <FaUsers />,
      menuId: "teachers",
      subItems: [
        {
          path: "/teachers/register",
          label: "sidebar.teacherRegister",
          icon: <FaUserPlus />,
        },
        {
          path: "/teachers/all",
          label: "sidebar.allTeachers",
          icon: <FaUserCheck />,
        },
      ],
    },
    {
      label: "sidebar.classes",
      icon: <FaChalkboardTeacher />,
      menuId: "classes",
      subItems: [
        {
          path: "/classes/add",
          label: "sidebar.addClass",
          icon: <FaUserPlus />,
        },
        {
          path: "/classes/all",
          label: "sidebar.allClasses",
          icon: <FaUserCheck />,
        },
      ],
    },

    {
      label: "sidebar.students",
      icon: <FaUserGraduate />,
      menuId: "students",
      subItems: [
        {
          path: "/students/register",
          label: "sidebar.studentRegister",
          icon: <FaUserPlus />,
        },
        {
          path: "/students/all",
          label: "sidebar.allStudents",
          icon: <FaUserCheck />,
        },
        // ✅ Add Scores
        {
          path: "/students/add-scores",
          label: "sidebar.addScores",
          icon: <FaClipboardList />,
        },
        // ✅ NEW: Print Result Card
        {
          path: "/students/print-result-card",
          label: "sidebar.printResultCard",
          icon: <FaPrint />,
        },
      ],
    },
    {
      label: "sidebar.payment",
      icon: <FaMoneyBillWave />,
      menuId: "payment",
      subItems: [
        // Teacher Payroll
        {
          path: "/payment/teacher",
          label: "Teacher Payroll",
          icon: <FaWallet />,
        },
        // Other Expenses
        {
          path: "/payment/expenses",
          label: "Other Expenses",
          icon: <FaReceipt />,
        },
      ],
    },
    { path: "/notes", label: "sidebar.notes", icon: <FaStickyNote /> },

    { path: "/settings", label: "sidebar.settings", icon: <FaCog /> },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-blue-900 to-slate-900 text-white flex-shrink-0 h-screen sticky top-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } ${isRtl ? "border-l" : "border-r"} border-blue-800 shadow-xl`}
    >
      {/* Header / Logo */}
      <div
        className={`flex items-center h-16 px-3 border-b border-blue-800/50 ${
          isRtl ? "space-x-reverse" : ""
        }`}
      >
        <span className="text-2xl flex-shrink-0">
          <TbDatabaseHeart />
        </span>
        {!isCollapsed && (
          <span className="text-xl font-bold tracking-wider ms-2">
            MP System
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-blue-800/60 transition-colors"
        >
          {isCollapsed ? (
            isRtl ? (
              <FaChevronLeft />
            ) : (
              <FaChevronRight />
            )
          ) : (
            <FaBars />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (!item.subItems) {
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path!}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-700/70 text-white shadow-md"
                          : "text-gray-300 hover:bg-blue-800/60 hover:text-white"
                      } ${isRtl ? "space-x-reverse" : ""}`
                    }
                  >
                    <span className="text-xl w-8 text-center flex-shrink-0">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium ms-2">
                        {t(item.label)}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            }

            const isActive = isSubItemActive(
              item.subItems.map((sub) => sub.path)
            );
            const isExpanded = expandedMenu === item.menuId;

            return (
              <li key={item.menuId}>
                <button
                  onClick={() => toggleMenu(item.menuId!)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-700/70 text-white shadow-md"
                      : "text-gray-300 hover:bg-blue-800/60 hover:text-white"
                  } ${isRtl ? "space-x-reverse" : ""}`}
                >
                  <span className="text-xl w-8 text-center flex-shrink-0">
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 text-start ms-2">
                        {t(item.label)}
                      </span>
                      <span className="ms-2">
                        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    </>
                  )}
                </button>

                {!isCollapsed && isExpanded && (
                  <ul className="mt-1 ms-6 border-s-2 ps-3 space-y-1 border-blue-700/30">
                    {item.subItems.map((sub) => {
                      const isTranslationKey = sub.label.startsWith("sidebar.");
                      return (
                        <li key={sub.path}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-blue-700/50 text-white"
                                  : "text-gray-400 hover:bg-blue-800/40 hover:text-white"
                              } ${isRtl ? "space-x-reverse" : ""}`
                            }
                          >
                            <span className="text-base w-6 text-center flex-shrink-0">
                              {sub.icon}
                            </span>
                            <span className="text-sm font-medium ms-2">
                              {isTranslationKey ? t(sub.label) : sub.label}
                            </span>
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;