import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const useSidebar = () => {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return {
    collapsed,
    mobileOpen,
    toggleCollapse: () => setCollapsed((p) => !p),
    openMobile:     () => setMobileOpen(true),
    closeMobile:    () => setMobileOpen(false),
  };
};

export default useSidebar;