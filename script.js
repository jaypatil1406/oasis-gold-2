const items = [
  { id: "snow", label: "Snow", image: "Snow.png" },
  { id: "clownfish", label: "Clownfish", image: "Clown_fish.png" },
  { id: "ghafTree", label: "Ghaf tree", image: "Ghaf_tree.png" },
  { id: "penguin", label: "Penguin", image: "Penguin.png" },
  { id: "elephant", label: "Elephant", image: "Elephant.png" },
  { id: "oasis", label: "Oasis", image: "Oasis.png" },
  { id: "fox", label: "Fox", image: "Fox_2.png" },
  { id: "rocks", label: "Rocks", image: "Rock_01.png" },
  { id: "sand", label: "Sand", image: "Sand.png" },
  { id: "mud", label: "Mud", image: "Mud.png" },
  { id: "oceanWaves", label: "Ocean waves", image: "Ocean_wave.png" },
  { id: "iceSurface", label: "Ice surface", image: "Ice_surface.png" },
  { id: "oryx", label: "Oryx", image: "Orynx.png" },
  { id: "lizard", label: "Lizard", image: "Lizard.png" },
  { id: "desertGrasses", label: "Desert grasses", image: "Food.png" },
  { id: "pineTree", label: "Pine tree", image: "Pine_tree.png" },
];

const nonLivingItems = ["oasis", "rocks", "sand", "mud"];
const livingItems = ["ghafTree", "fox", "oryx", "lizard", "desertGrasses"];

const trayTrack = document.getElementById("trayTrack");
const trayWindow = document.getElementById("trayWindow");
const placedObjects = document.getElementById("placedObjects");
const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");
const scene = document.getElementById("scene");
const questionText = document.querySelector(".question-panel span:last-child");

let drag = null;
let oasisPlaced = false;
let rocksPlaced = 0;
let currentStage = "nonLiving";

const placedItemIds = new Set();

function getItem(id) {
  return items.find((item) => item.id === id);
}

function isItemAllowed(id) {
  const notAllowedItems = [
    "iceSurface",
    "oceanWaves",
    "snow",
    "clownfish",
    "penguin",
    "elephant",
  ];

  if (notAllowedItems.includes(id)) return false;

  if (currentStage === "nonLiving") {
    return nonLivingItems.includes(id);
  }

  return livingItems.includes(id);
}

function updateStage() {
  const nonLivingComplete = nonLivingItems.every((id) => placedItemIds.has(id));

  if (nonLivingComplete) {
    currentStage = "living";

    questionText.innerHTML =
      "Drag the living things<br>that you can find in the desert.";
  } else {
    currentStage = "nonLiving";

    questionText.innerHTML =
      "Drag the non-living things<br>that you can find in the desert.";
  }
}

function renderTray() {
  trayTrack.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");

    card.className = "tray-item";
    card.dataset.itemId = item.id;

    card.innerHTML = `
      <img src="assets/${item.image}" alt="">
      <span>${item.label}</span>
    `;

    card.addEventListener("mousedown", (event) => {
      startDrag(event, item, card);
    });

    trayTrack.appendChild(card);
  });

  updateArrows();
}

function updateArrows() {
  const maxScroll = trayWindow.scrollWidth - trayWindow.clientWidth;

  leftArrow.disabled = trayWindow.scrollLeft <= 1;
  rightArrow.disabled = trayWindow.scrollLeft >= maxScroll - 1;
}

leftArrow.addEventListener("click", () => {
  trayWindow.scrollBy({
    left: -trayWindow.clientWidth,
    behavior: "smooth",
  });
});

rightArrow.addEventListener("click", () => {
  trayWindow.scrollBy({
    left: trayWindow.clientWidth,
    behavior: "smooth",
  });
});

trayWindow.addEventListener("scroll", updateArrows);
trayWindow.addEventListener("wheel", (event) => {
  event.preventDefault();

  trayWindow.scrollBy({
    left: event.deltaY > 0 ? 100 : -100,
    behavior: "smooth",
  });
}, { passive: false });

function createGhost(src, x, y) {
  const ghost = document.createElement("img");

  ghost.className = "drag-ghost";
  ghost.src = src;

  document.body.appendChild(ghost);

  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;

  return ghost;
}

function startDrag(event, item, sourceCard) {
  if (event.button !== 0) return;

  event.preventDefault();

  const ghost = createGhost(
    `assets/${item.image}`,
    event.clientX,
    event.clientY,
  );

  if (item.id === "ghafTree") {
    const treeImage = document.getElementById("treeImage");
    const treeBounds = treeImage.getBoundingClientRect();

    ghost.style.width = `${treeBounds.width}px`;
    ghost.style.height = `${treeBounds.height}px`;
  }

  const allowed = isItemAllowed(item.id);

  drag = {
    item,
    sourceCard,
    ghost,
    fromScene: false,
    allowed,
  };

  document.body.style.cursor = allowed ? "grabbing" : "not-allowed";

  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", endDrag, { once: true });
}

function startPlacedDrag(event, itemId, imageElement) {
  if (event.button !== 0) return;

  event.preventDefault();

  const item = getItem(itemId);

  if (!item) return;

  drag = {
    item,
    ghost: createGhost(imageElement.src, event.clientX, event.clientY),
    fromScene: true,
    original: imageElement,
  };

  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", endDrag, { once: true });
}

function moveDrag(event) {
  if (!drag) return;

  drag.ghost.style.left = `${event.clientX}px`;
  drag.ghost.style.top = `${event.clientY}px`;
}

function removeOasisExtras() {
  oasisPlaced = false;
  rocksPlaced = 0;

  scene.classList.remove("oasis-active");

  document.getElementById("treeImage").src =
    "assets/Ghaf_tree_yellow_leaves8.png";

  placedObjects
    .querySelectorAll('.sun-decoration, [data-item-id="rocks"]')
    .forEach((element) => element.remove());
}

function endDrag(event) {
  if (!drag) return;

  const trayRect = document.querySelector(".tray").getBoundingClientRect();

  const sceneRect = scene.getBoundingClientRect();

  const droppedInTray =
    event.clientX >= trayRect.left &&
    event.clientX <= trayRect.right &&
    event.clientY >= trayRect.top &&
    event.clientY <= trayRect.bottom;

  const droppedInScene =
    event.clientX >= sceneRect.left &&
    event.clientX <= sceneRect.right &&
    event.clientY >= sceneRect.top &&
    event.clientY <= sceneRect.bottom &&
    event.clientY < trayRect.top;

  if (drag.fromScene && droppedInTray) {
    const removedId = drag.item.id;

    drag.original.remove();
    placedItemIds.delete(removedId);

    if (removedId === "oasis") {
      removeOasisExtras();
    }

    if (removedId === "rocks") {
      rocksPlaced = Math.max(0, rocksPlaced - 1);
    }

    updateStage();
  } else if (!drag.fromScene && droppedInScene && isItemAllowed(drag.item.id)) {
    placeItem(drag.item);
  } else if (!drag.fromScene && droppedInScene && drag.allowed) {
    placeItem(drag.item);
  }

  drag.ghost.remove();
  drag = null;

  document.removeEventListener("mousemove", moveDrag);
  document.body.style.cursor = "default";
  updateArrows();
}

function addPlacedImage(item, options) {
  const image = document.createElement("img");

  image.src = options.src || `assets/${item.image}`;
  image.alt = item.label;
  image.className = `placed ${options.className || ""}`.trim();

  image.dataset.itemId = item.id;

  image.style.left = options.left;
  image.style.top = options.top;
  image.style.width = options.width;
  image.style.height = options.height;
  image.style.objectFit = "contain";
  image.style.objectPosition = "center bottom";

  image.addEventListener("mousedown", (event) => {
    startPlacedDrag(event, item.id, image);
  });

  placedObjects.appendChild(image);

  placedItemIds.add(item.id);

  updateStage();

  return image;
}

function placeItem(item) {
  if (placedItemIds.has(item.id)) return;

  if (item.id === "oasis") {
    oasisPlaced = true;

    scene.classList.add("oasis-active");

    document.getElementById("treeImage").src = "assets/Ghaf_tree_OA2.png";

    addPlacedImage(item, {
      src: "assets/Oasis.png",
      className: "oasis-image",
      left: "48%",
      top: "59%",
      width: "27%",
      height: "17%",
    });

    const sun = document.createElement("img");

    sun.src = "assets/Sun.png";
    sun.alt = "Sun";
    sun.className = "sun-decoration";

    sun.style.left = "29%";
    sun.style.top = "15%";
    sun.style.width = "8%";
    sun.style.height = "12%";
    sun.style.objectFit = "contain";

    placedObjects.appendChild(sun);

    return;
  }

  if (item.id === "rocks") {
    if (!oasisPlaced || rocksPlaced >= 1) return;

    addPlacedImage(item, {
      src: "assets/Rocks_hiding_without_lizard1.png",
      left: "70%",
      top: "66%",
      width: "9%",
      height: "9%",
    });

    rocksPlaced++;

    return;
  }

  if (item.id === "sand") {
    addPlacedImage(item, {
      left: "40%",
      top: "68%",
      width: "10%",
      height: "9%",
    });

    return;
  }

  if (item.id === "mud") {
    addPlacedImage(item, {
      left: "65%",
      top: "58%",
      width: "8%",
      height: "8%",
    });

    return;
  }

  if (item.id === "ghafTree") {
    addPlacedImage(item, {
      src: "assets/Ghaf_tree_OA2.png",
      className: "living-ghaf-tree",
      left: "54%",
      top: "20%",
      width: "24%",
      height: "43%",
    });

    return;
  }

  if (item.id === "fox") {
    addPlacedImage(item, {
      left: "66%",
      top: "60%",
      width: "9%",
      height: "8%",
    });

    return;
  }

  if (item.id === "oryx") {
    addPlacedImage(item, {
      left: "69%",
      top: "60%",
      width: "12%",
      height: "10%",
    });

    return;
  }

  if (item.id === "lizard") {
    addPlacedImage(item, {
      left: "72%",
      top: "70%",
      width: "5%",
      height: "6%",
    });

    return;
  }

  if (item.id === "desertGrasses") {
    addPlacedImage(item, {
      left: "43%",
      top: "62%",
      width: "8%",
      height: "8%",
    });

    return;
  }
}

document.getElementById("resetButton").addEventListener("click", () => {
  placedObjects.innerHTML = "";

  placedItemIds.clear();

  oasisPlaced = false;
  rocksPlaced = 0;

  scene.classList.remove("oasis-active");

  document.getElementById("treeImage").src =
    "assets/Ghaf_tree_yellow_leaves8.png";

  updateStage();
});

window.addEventListener("resize", updateArrows);

renderTray();
updateStage();
