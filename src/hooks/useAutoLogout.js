import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAutoLogout = (timeout = 60000) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timer = useRef(null);
  const hasStarted = useRef(false);

  const logout = () => {
    console.log("Auto logging out...");
    localStorage.removeItem('authToken');
    localStorage.removeItem('matterNumber');
    localStorage.removeItem('viewClientsDateFilter');
    hasStarted.current = false;

    if (location.pathname.startsWith('/client')) {
      navigate('/client/login');
    } else {
      navigate('/admin/login');
    }
  };

  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(logout, timeout);
  };

  useEffect(() => {
    const isClient = !!localStorage.getItem('matterNumber');
    const isAdmin = !!localStorage.getItem('authToken');

    if ((isClient || isAdmin) && !hasStarted.current) {
      hasStarted.current = true;
      console.log("Auto logout timer started...");

      const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
      const handleActivity = () => resetTimer();

      events.forEach(event => window.addEventListener(event, handleActivity));
      resetTimer();

      return () => {
        events.forEach(event => window.removeEventListener(event, handleActivity));
        clearTimeout(timer.current);
      };
    }
  }, []);
};

export default useAutoLogout;
