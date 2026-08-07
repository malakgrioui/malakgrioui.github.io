/* Shared navigation behaviour.
   Replaces the 5-line script that was duplicated across every page — which is
   why the language switcher had drifted into four different variants. */
(() => {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setOpen(!isOpen());
  });

  // Escape closes and returns focus to the control that opened the panel.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && !links.contains(event.target)) setOpen(false);
  });

  // Following a link should not leave the panel reporting itself as open.
  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Resizing past the breakpoint hides the panel; its state must follow.
  window.matchMedia('(min-width: 641px)').addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
})();
