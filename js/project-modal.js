function buildTags(tags) {
  return tags.map((tag) => `<span class="project-tag">${tag}</span>`).join("");
}

function buildFeatures(features) {
  return features.map((feature) => `<li>${feature}</li>`).join("");
}

function buildGallery(gallery, title) {
  return gallery.map((image, index) => `
    <figure class="macbook">
      <div class="macbook__screen">
        <img src="${image}" alt="${title} screenshot ${index + 1}" loading="lazy">
      </div>
    </figure>
  `).join("");
}

export function createProjectModal(modalElement) {
  const content = modalElement.querySelector("#project-modal-content");
  const closeControls = modalElement.querySelectorAll("[data-modal-close]");
  let lastFocusedElement = null;

  const closeModal = () => {
    modalElement.classList.remove("is-open");
    modalElement.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const openModal = (project, trigger) => {
    lastFocusedElement = trigger ?? document.activeElement;
    content.innerHTML = `
      <div class="modal-layout">
        <div class="modal-hero">
          <img src="${project.image}" alt="${project.title} hero preview">
        </div>
        <div class="modal-copy">
          <h2 id="modal-title">${project.title}</h2>
          <p>${project.description}</p>
        </div>
        <div class="modal-meta">${buildTags(project.tech)}</div>
        <ul class="modal-feature-list">${buildFeatures(project.features)}</ul>
        <div class="modal-actions">
          <a class="button button--primary" href="${project.github}" target="_blank" rel="noreferrer">GitHub</a>
          ${project.demo ? `<a class="button button--secondary" href="${project.demo}" target="_blank" rel="noreferrer">Live Demo</a>` : ""}
        </div>
        <div class="modal-gallery">${buildGallery(project.gallery, project.title)}</div>
      </div>
    `;

    modalElement.classList.add("is-open");
    modalElement.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalElement.querySelector(".project-modal__close")?.focus();
  };

  closeControls.forEach((control) => {
    control.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalElement.classList.contains("is-open")) {
      closeModal();
    }
  });

  return { openModal, closeModal };
}
