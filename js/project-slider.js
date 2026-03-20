function createProjectCard(project, index) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.dataset.index = String(index);
  card.tabIndex = 0;
  card.setAttribute("aria-label", `${project.title} project card`);

  card.innerHTML = `
    <div class="project-card__media">
      <img src="${project.image}" alt="${project.title}" loading="lazy">
    </div>
    <div class="project-card__body">
      <div>
        <h3 class="project-card__title">${project.title}</h3>
        <p class="project-card__subtitle">${project.description}</p>
      </div>
      <div class="project-card__tags">
        ${project.tech.map((item) => `<span class="project-tag">${item}</span>`).join("")}
      </div>
    </div>
    <button class="project-card__plus" type="button" aria-label="Open details for ${project.title}">+</button>
  `;

  return card;
}

export function createProjectSlider({ sliderElement, projects, onOpenProject }) {
  let currentIndex = 0;
  const cards = projects.map(createProjectCard);

  cards.forEach((card, index) => {
    const openButton = card.querySelector(".project-card__plus");
    openButton?.addEventListener("click", () => onOpenProject(projects[index], openButton));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenProject(projects[index], card);
      }
    });
    sliderElement.appendChild(card);
  });

  const getStep = () => {
    const firstCard = cards[0];
    if (!firstCard) {
      return 0;
    }

    const styles = window.getComputedStyle(sliderElement);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    return firstCard.getBoundingClientRect().width + gap;
  };

  const syncCurrentIndex = () => {
    const step = getStep();
    if (!step) {
      return;
    }

    currentIndex = Math.round(sliderElement.scrollLeft / step);
  };

  const scrollToIndex = (index, behavior = "smooth") => {
    const step = getStep();
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));
    sliderElement.scrollTo({
      left: currentIndex * step,
      behavior
    });
  };

  sliderElement.addEventListener("scroll", () => {
    window.requestAnimationFrame(syncCurrentIndex);
  }, { passive: true });

  sliderElement.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      sliderElement.scrollBy({
        left: event.deltaY,
        behavior: "auto"
      });
    }
  }, { passive: false });

  sliderElement.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToIndex(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToIndex(currentIndex - 1);
    }
  });

  const prevButton = document.querySelector("[data-slider-prev]");
  const nextButton = document.querySelector("[data-slider-next]");

  prevButton?.addEventListener("click", () => scrollToIndex(currentIndex - 1));
  nextButton?.addEventListener("click", () => scrollToIndex(currentIndex + 1));

  const resizeObserver = new ResizeObserver(() => {
    scrollToIndex(currentIndex, "auto");
  });

  resizeObserver.observe(sliderElement);

  return {
    destroy() {
      resizeObserver.disconnect();
    }
  };
}
