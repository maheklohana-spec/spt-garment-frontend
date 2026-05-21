import { useEffect } from 'react';

export default function useEnterKey() {
  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key !== 'Enter') return;
      
      // Skip if textarea, button, or select
      const tag = document.activeElement.tagName;
      if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;
      
      e.preventDefault();

      // Get all focusable inputs on page
      const focusable = Array.from(
        document.querySelectorAll(
          'input:not([disabled]):not([readonly]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
        )
      ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      });

      const current = document.activeElement;
      const index = focusable.indexOf(current);

      if (index !== -1 && index < focusable.length - 1) {
        focusable[index + 1].focus();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, []);
}