"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const Header = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <header className="bg-blue-700 text-white h-12 flex items-center justify-between px-6 fixed top-0 w-full shadow-md z-50">
        <h1
          className="text-sm font-bold cursor-pointer hover:opacity-80"
          onClick={() => router.push("/")}
        >
          Monitoring FF BSI - GRIYA
        </h1>
      </header>
    );
  }

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  return (
    <header className="bg-blue-700 text-white h-12 flex items-center justify-between px-6 fixed top-0 w-full shadow-md z-50">
      <h1
        className="text-sm font-bold cursor-pointer hover:opacity-80"
        onClick={() => router.push("/")}
      >
        Monitoring FF BSI - GRIYA
      </h1>

      {!session ? (
        <>
          <div className="flex space-x-6 items-center text-sm mx-auto">
            <Dropdown
              title="Grafik"
              isOpen={openDropdown === "grafik"}
              toggle={() => toggleDropdown("grafik")}
              items={[
                "Akumulasi Realtime",
                "Pending & Progress",
                "Monitoring iDeb",
                "Trend Hold Aplikasi",
                "Trend Aplikasi Masuk",
                "Trend Nominal Pencairan",
                "Trend Pencairan",
              ]}
              category="grafik"
              router={router}
            />
            <Dropdown
              title="Productivity"
              isOpen={openDropdown === "productivity"}
              toggle={() => toggleDropdown("productivity")}
              items={["Realisasi SLA FF", "Pipeline FF"]}
              category="productivity"
              router={router}
            />
            <Dropdown
              title="Report"
              isOpen={openDropdown === "report"}
              toggle={() => toggleDropdown("report")}
              items={[
                "Report LD Pencairan",
                "Report Per Period",
                "Grafik Alasan Cancel Reject",
              ]}
              category="report"
              router={router}
            />
            <Dropdown
              title="Griya"
              isOpen={openDropdown === "griya"}
              toggle={() => toggleDropdown("griya")}
              items={[
                "Pipeline Griya",
                "Report Griya",
                "Report SLA Griya",
                "Master PKS Griya",
                "Pending Progress Griya",
              ]}
              category="griya"
              alignRight
              router={router}
            />

            <button
              className="hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
              onClick={() => router.push("/inquiry-aplikasi")}
            >
              Inquiry Aplikasi
            </button>
          </div>
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white text-sm px-4 py-2 rounded"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </button>
        </>
      ) : (
        <>
          <Dropdown
            title="Administrator"
            isOpen={openDropdown === "administrator"}
            toggle={() => toggleDropdown("administrator")}
            items={[
              "Users",
              "Groups",
              "Divisi",
              "Master Parameter",
              "Maintenance RO (Area)",
              "Monitoring Helpdesk",
              "Monitoring Akses IP Address",
              "Manajemen Menu",
              "IT Helpdesk Task",
              "File Finder (Logs View)",
            ]}
            category="administrator"
            router={router}
          />
          <button
            className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
            onClick={() => signOut()}
          >
            Logout
          </button>
        </>
      )}
    </header>
  );
};

const Dropdown = ({ title, isOpen, toggle, items, category, alignRight, router }) => (
  <div className="relative dropdown-container">
    <button onClick={toggle} className="hover:bg-blue-600 px-4 py-2 rounded">
      {title} ▼
    </button>
    {isOpen && (
      <div
        className={`absolute mt-2 w-56 bg-white text-black rounded shadow-lg max-h-64 overflow-auto ${
          alignRight ? "right-0" : "left-0"
        }`}
      >
        {items.map((item, index) => (
          <DropdownItem
            key={index}
            text={item}
            category={category}
            router={router}
            toggleDropdown={toggle}
          />
        ))}
      </div>
    )}
  </div>
);

const DropdownItem = ({ text, category, router, toggleDropdown }) => {
  const formattedPath = `/${category}/${text.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <a
      onClick={() => {
        router.push(formattedPath);
        toggleDropdown();
      }}
      className="block px-4 py-2 hover:bg-gray-200 cursor-pointer"
    >
      {text}
    </a>
  );
};

export default Header;
