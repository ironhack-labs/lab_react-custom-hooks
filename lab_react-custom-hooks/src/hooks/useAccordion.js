import { useCallback, useState } from "react";

function useAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return [isOpen, toggle, setIsOpen];
}

export default useAccordion;
