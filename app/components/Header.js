"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  MENU_SECTIONS,
  STANDALONE_LINKS,
  normalizeMenuPath,
} from "@/lib/menu-config";

const PUBLIC_SECTION_KEYS = ["grafik", "productivity", "report", "griya"];
const ADMIN_SECTION_KEY = "administrator";
const INQUIRY_LINK_KEY = "inquiry-aplikasi";

const Header = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [allowedPaths, setAllowedPaths] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === "loading") {
      setAllowedPaths(null);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const loadAllowed = async () => {
      try {
        setAllowedPaths(null);
        const res = await fetch("/api/menu-permissions/allowed", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!isActive) return;

        if (Array.isArray(json?.data)) {
          const normalized = json.data
            .map((item) => item?.normalizedPath ?? item?.urlPath)
            .filter(Boolean)
            .map((path) => normalizeMenuPath(path));
          setAllowedPaths(new Set(normalized));
        } else {
          setAllowedPaths(new Set());
        }
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Gagal memuat menu izin:", error);
        if (isActive) {
          setAllowedPaths(null);
        }
      }
    };

    loadAllowed();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [status, session?.user?.id]);

  const renderFallbackHeader = () => (
    <header className="bg-blue-700 text-white h-12 flex items-center justify-between px-6 fixed top-0 w-full shadow-md z-50">
      <h1
        className="text-white font-bold cursor-pointer hover:opacity-80"
        onClick={() => router.push("/")}
      >
        Monitoring FF BSI
      </h1>
    </header>
  );

  if (!isMounted || status === "loading") {
    return renderFallbackHeader();
  }

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const allowedSet =
    allowedPaths && allowedPaths instanceof Set ? allowedPaths : null;

  const filterItems = (items) => {
    if (!allowedSet) return items;
    return items.filter((item) => allowedSet.has(item.normalizedPath));
  };

  const publicSections = MENU_SECTIONS.filter((section) =>
    PUBLIC_SECTION_KEYS.includes(section.key)
  );
  const adminSection = MENU_SECTIONS.find(
    (section) => section.key === ADMIN_SECTION_KEY
  );
  const inquiryLink = STANDALONE_LINKS.find(
    (link) => link.key === INQUIRY_LINK_KEY
  );
  const showInquiryButton =
    !inquiryLink ||
    allowedSet === null ||
    allowedSet.has(inquiryLink.normalizedPath);

  return (
    <header className="bg-blue-700 text-white h-12 flex items-center justify-between px-6 fixed top-0 w-full shadow-md z-50">
      <h1
        className="text-white font-bold cursor-pointer hover:opacity-80"
        onClick={() => router.push("/")}
      >
        Monitoring FF BSI
      </h1>

      {!session ? (
        <>
          <div className="flex space-x-6 items-center text-sm mx-auto">
            {publicSections.map((section) => {
              const visibleItems = filterItems(section.items);
              if (visibleItems.length === 0) return null;
              return (
                <Dropdown
                  key={section.key}
                  title={section.title}
                  isOpen={openDropdown === section.key}
                  toggle={() => toggleDropdown(section.key)}
                  items={visibleItems}
                  alignRight={section.alignRight}
                  router={router}
                />
              );
            })}

            {showInquiryButton && inquiryLink && (
              <button
                className="hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
                onClick={() => router.push(inquiryLink.path)}
              >
                {inquiryLink.label}
              </button>
            )}
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
          {adminSection && (
            <Dropdown
              title={adminSection.title}
              isOpen={openDropdown === adminSection.key}
              toggle={() => toggleDropdown(adminSection.key)}
              items={filterItems(adminSection.items)}
              alignRight={adminSection.alignRight}
              router={router}
            />
          )}
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

const Dropdown = ({ title, isOpen, toggle, items, alignRight, router }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
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
          {items.map((item) => (
            <DropdownItem
              key={item.path}
              item={item}
              router={router}
              toggleDropdown={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ item, router, toggleDropdown }) => {
  const handleClick = () => {
    router.push(item.path);
    toggleDropdown();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full px-4 py-2 text-left hover:bg-gray-200"
    >
      {item.label}
    </button>
  );
};

export default Header;
