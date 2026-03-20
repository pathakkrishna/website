import { projects } from "./project-data.js";
import { createProjectSlider } from "./project-slider.js";
import { createProjectModal } from "./project-modal.js";

const body = document.body;
const themeToggle = document.querySelector(".theme-toggle");
const modal = createProjectModal(document.querySelector("#project-modal"));
const sliderElement = document.querySelector("#project-slider");
const techSlider = document.querySelector("#tech-stack-slider");

function initThemeToggle() {
  const storageKey = "portfolio-theme";
  const savedTheme = window.localStorage.getItem(storageKey);

  if (savedTheme === "light") {
    body.classList.add("light-theme");
    themeToggle?.setAttribute("aria-pressed", "true");
  }

  themeToggle?.addEventListener("click", () => {
    const isLight = body.classList.toggle("light-theme");
    themeToggle.setAttribute("aria-pressed", String(isLight));
    window.localStorage.setItem(storageKey, isLight ? "light" : "dark");
  });
}

function initRevealObserver() {
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealElements.forEach((element) => observer.observe(element));
}

function initProjectShowcase() {
  if (!sliderElement) {
    return;
  }

  createProjectSlider({
    sliderElement,
    projects,
    onOpenProject: (project, trigger) => modal.openModal(project, trigger)
  });
}

function initTechSlider() {
  if (!techSlider) {
    return;
  }

  const categories = [...techSlider.children];
  let currentIndex = 0;

  const getStep = () => {
    const first = categories[0];
    if (!first) {
      return 0;
    }

    const styles = window.getComputedStyle(techSlider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    return first.getBoundingClientRect().width + gap;
  };

  const scrollToIndex = (index, behavior = "smooth") => {
    const step = getStep();
    currentIndex = Math.max(0, Math.min(index, categories.length - 1));
    techSlider.scrollTo({
      left: currentIndex * step,
      behavior
    });
  };

  techSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(currentIndex - 1);
    }
  });

  techSlider.addEventListener("scroll", () => {
    const step = getStep();
    if (step) {
      currentIndex = Math.round(techSlider.scrollLeft / step);
    }
  }, { passive: true });

  document.querySelector("[data-tech-prev]")?.addEventListener("click", () => {
    scrollToIndex(currentIndex - 1);
  });

  document.querySelector("[data-tech-next]")?.addEventListener("click", () => {
    scrollToIndex(currentIndex + 1);
  });

  const resizeObserver = new ResizeObserver(() => {
    scrollToIndex(currentIndex, "auto");
  });

  resizeObserver.observe(techSlider);
}

initThemeToggle();
initRevealObserver();
initProjectShowcase();
initTechSlider();
