import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("adminAuthenticated");
      setIsAuthenticated(authStatus === "true");
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = () => {
    localStorage.setItem("adminAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("adminAuthenticated");
    setIsAuthenticated(false);
    navigate("/admin/login");
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
};
