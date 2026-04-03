import { useEffect } from "react";
import { saveCurrentSessionFromLocalStorage } from "../utils/history";

const HistoryAutoSaver = () => {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveCurrentSessionFromLocalStorage();
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
};

export default HistoryAutoSaver;
