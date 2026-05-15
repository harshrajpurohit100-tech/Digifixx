const header = document.querySelector(".site-header");
const yearTargets = document.querySelectorAll("[data-year]");

yearTargets.forEach((el) => {
  el.textContent = String(new Date().getFullYear());
});

if (header) {
  const onScroll = () => {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
