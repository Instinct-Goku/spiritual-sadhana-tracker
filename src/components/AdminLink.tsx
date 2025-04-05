
import React from "react";
import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const AdminLink = () => {
  return (
    <NavLink
      to="/admin"
      className={({ isActive }) =>
        `${
          isActive ? "bg-spiritual-purple/10 text-spiritual-purple" : "text-muted-foreground hover:bg-muted"
        } flex items-center gap-3 rounded-lg px-3 py-2 transition-all`
      }
      title="Admin Dashboard"
    >
      <ShieldCheck className="h-5 w-5" />
      <span className="text-sm font-medium">Admin</span>
    </NavLink>
  );
};

export default AdminLink;
