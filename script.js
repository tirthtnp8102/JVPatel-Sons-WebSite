const STORAGE_KEY = "surat-loom-gallery";

const seedPatterns = [
  {
    id: "seed-1",
    name: "Diamond Jaal Grey",
    weight: "64 grams",
    machine: "Power Loom",
    image: "assets/pattern-diamond.svg",
    custom: false,
  },
  {
    id: "seed-2",
    name: "Flowing Resham Wave",
    weight: "68 grams",
    machine: "Water Jet",
    image: "assets/pattern-wave.svg",
    custom: false,
  },
  {
    id: "seed-3",
    name: "Floral Buta Base",
    weight: "72 grams",
    machine: "Pattern Development",
    image: "assets/pattern-floral.svg",
    custom: false,
  },
];

const galleryGrid = document.querySelector("#gallery-grid");
const galleryForm = document.querySelector("#gallery-form");
const resetButton = document.querySelector("#reset-gallery");
const template = document.querySelector("#gallery-card-template");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");

function loadCustomPatterns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function saveCustomPatterns(patterns) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
}

function getAllPatterns() {
  return [...seedPatterns, ...loadCustomPatterns()];
}

function createGalleryCard(pattern) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".gallery-card");
  const image = fragment.querySelector(".gallery-image");
  const tag = fragment.querySelector(".gallery-tag");
  const title = fragment.querySelector("h3");
  const weight = fragment.querySelector(".weight-pill");
  const removeButton = fragment.querySelector(".remove-entry");

  image.src = pattern.image;
  image.alt = `${pattern.name} saree grey material pattern`;
  tag.textContent = pattern.machine || "Grey Material";
  title.textContent = pattern.name;
  weight.textContent = pattern.weight;

  if (pattern.custom) {
    removeButton.hidden = false;
    removeButton.addEventListener("click", () => removePattern(pattern.id));
  }

  requestAnimationFrame(() => {
    card.classList.add("visible");
  });

  return fragment;
}

function renderGallery() {
  const patterns = getAllPatterns();
  galleryGrid.innerHTML = "";
  patterns.forEach((pattern) => galleryGrid.appendChild(createGalleryCard(pattern)));
}

function removePattern(id) {
  const customPatterns = loadCustomPatterns().filter((pattern) => pattern.id !== id);
  saveCustomPatterns(customPatterns);
  renderGallery();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(galleryForm);
  const name = formData.get("patternName")?.toString().trim();
  const weight = formData.get("patternWeight")?.toString().trim();
  const machine = formData.get("patternMachine")?.toString().trim() || "Custom Upload";
  const imageFile = formData.get("patternImage");

  if (!name || !weight) {
    return;
  }

  const appendPattern = (image) => {
    const customPatterns = loadCustomPatterns();
    customPatterns.unshift({
      id: `custom-${Date.now()}`,
      name,
      weight,
      machine,
      image,
      custom: true,
    });

    saveCustomPatterns(customPatterns);
    galleryForm.reset();
    renderGallery();
  };

  if (imageFile && imageFile.size > 0) {
    const reader = new FileReader();
    reader.onload = () => appendPattern(reader.result);
    reader.readAsDataURL(imageFile);
    return;
  }

  appendPattern("assets/pattern-diamond.svg");
}

function animateMetrics() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const element = entry.target;
        const target = Number(element.dataset.count);
        let current = 0;
        const increment = Math.max(1, Math.ceil(target / 32));

        const tick = () => {
          current = Math.min(target, current + increment);
          element.textContent = current;

          if (current < target) {
            requestAnimationFrame(tick);
          }
        };

        tick();
        observer.unobserve(element);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupMobileMenu() {
  if (!menuToggle || !nav) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (galleryForm && galleryGrid && template) {
  galleryForm.addEventListener("submit", handleFormSubmit);
  renderGallery();
}

if (resetButton && galleryGrid) {
  resetButton.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderGallery();
  });
}

animateMetrics();
setupMobileMenu();
