
const items = [
  {id:"snow",label:"Snow",image:"Snow.png"},
  {id:"clownfish",label:"Clownfish",image:"Clown_fish.png"},
  {id:"ghafTree",label:"Ghaf tree",image:"Ghaf_tree.png"},
  {id:"penguin",label:"Penguin",image:"Penguin.png"},
  {id:"elephant",label:"Elephant",image:"Elephant.png"},
  {id:"oasis",label:"Oasis",image:"Oasis.png"},
  {id:"fox",label:"Fox",image:"Fox_2.png"},
  {id:"rocks",label:"Rocks",image:"Rock_01.png"},
  {id:"sand",label:"Sand",image:"Sand.png"},
  {id:"mud",label:"Mud",image:"Mud.png"},
  {id:"oceanWaves",label:"Ocean waves",image:"Ocean_wave.png"},
  {id:"iceSurface",label:"Ice surface",image:"Ice_surface.png"},
  {id:"oryx",label:"Oryx",image:"Orynx.png"},
  {id:"lizard",label:"Lizard",image:"Lizard.png"},
  {id:"desertGrasses",label:"Desert grasses",image:"Food.png"},
  {id:"pineTree",label:"Pine tree",image:"Pine_tree.png"}
];

// Only these four objects can be placed
const allowedItems = [
  "oasis",
  "rocks",
  "sand",
  "mud"
];

const trayTrack = document.getElementById("trayTrack");
const trayWindow = document.getElementById("trayWindow");
const placedObjects = document.getElementById("placedObjects");
const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");
const scene = document.getElementById("scene");

let drag = null;
let oasisPlaced = false;
let rocksPlaced = 0;

// Render all objects inside the tray
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

// Update arrow button states
function updateArrows() {
  const maxScroll =
    trayWindow.scrollWidth - trayWindow.clientWidth;

  leftArrow.disabled = trayWindow.scrollLeft <= 1;

  rightArrow.disabled =
    trayWindow.scrollLeft >= maxScroll - 1;
}

// Scroll left
leftArrow.addEventListener("click", () => {
  trayWindow.scrollBy({
    left: -trayWindow.clientWidth,
    behavior: "smooth"
  });
});

// Scroll right
rightArrow.addEventListener("click", () => {
  trayWindow.scrollBy({
    left: trayWindow.clientWidth,
    behavior: "smooth"
  });
});

// Update arrows while scrolling
trayWindow.addEventListener("scroll", updateArrows);

// Start dragging an object from the tray
function startDrag(event, item, sourceCard) {
  if (event.button !== 0) return;

  event.preventDefault();

  const ghost = document.createElement("img");

  ghost.className = "drag-ghost";
  ghost.src = `assets/${item.image}`;

  document.body.appendChild(ghost);

  drag = {
    item,
    sourceCard,
    ghost,
    fromScene: false
  };

  moveGhost(event.clientX, event.clientY);

  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", endDrag, {once:true});
}

// Start dragging an object already placed in the scene
function startPlacedDrag(event, itemId, imageElement) {
  if (event.button !== 0) return;

  event.preventDefault();

  const item = items.find((entry) => entry.id === itemId);

  if (!item) return;

  const ghost = document.createElement("img");

  ghost.className = "drag-ghost";
  ghost.src = imageElement.src;

  document.body.appendChild(ghost);

  drag = {
    item,
    ghost,
    fromScene: true,
    original: imageElement
  };

  moveGhost(event.clientX, event.clientY);

  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", endDrag, {once:true});
}

// Move dragged image
function moveGhost(x, y) {
  if (!drag) return;

  drag.ghost.style.left = `${x}px`;
  drag.ghost.style.top = `${y}px`;
}

// Handle mouse movement
function moveDrag(event) {
  moveGhost(event.clientX, event.clientY);
}

// Handle dropping an object
function endDrag(event) {
  if (!drag) return;

  const trayRect =
    document.querySelector(".tray").getBoundingClientRect();

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

  // Return an object from scene to tray
  if (drag.fromScene && droppedInTray) {

    drag.original.remove();

    // Remove Oasis and restore original scene
    if (drag.item.id === "oasis") {

      oasisPlaced = false;
      rocksPlaced = 0;

      scene.classList.remove("oasis-active");

      // Restore dry Ghaf tree
      document.getElementById("treeImage").src =
        "assets/Ghaf_tree_yellow_leaves8.png";

      // Remove the sun
      const sun =
        placedObjects.querySelector(".sun-decoration");

      if (sun) {
        sun.remove();
      }

      // Remove placed rocks
      const rocks =
        placedObjects.querySelectorAll('[data-item-id="rocks"]');

      rocks.forEach((rock) => rock.remove());
    }

    // Update rocks count
    if (drag.item.id === "rocks") {
      rocksPlaced = Math.max(0, rocksPlaced - 1);
    }
  }

  // Place a new object in the scene
  else if (!drag.fromScene && droppedInScene) {

    if (allowedItems.includes(drag.item.id)) {
      placeItem(drag.item);
    }
  }

  drag.ghost.remove();
  drag = null;

  document.removeEventListener("mousemove", moveDrag);

  updateArrows();
}

// Place an object inside the scene
function placeItem(item) {

  // Place Oasis in the RED area
  if (item.id === "oasis") {

    if (oasisPlaced) return;

    oasisPlaced = true;

    // Change the desert background
    scene.classList.add("oasis-active");

    // Change dry tree into green Ghaf tree
    document.getElementById("treeImage").src =
      "assets/Ghaf_tree_OA2.png";

    // Create complete Oasis image
    const oasis = document.createElement("img");

    oasis.src = "assets/Oasis.png";
    oasis.alt = "Oasis water";
    oasis.className = "placed oasis-image";
    oasis.dataset.itemId = "oasis";

    // Red area position
    oasis.style.left = "48%";
    oasis.style.top = "59%";
    oasis.style.width = "27%";
    oasis.style.height = "17%";
    oasis.style.objectFit = "contain";

    oasis.addEventListener("mousedown", (event) => {
      startPlacedDrag(event, "oasis", oasis);
    });

    placedObjects.appendChild(oasis);

    // Add Sun near the Ghaf tree
    const sun = document.createElement("img");

    sun.src = "assets/Sun.png";
    sun.alt = "Sun";
    sun.className = "sun-decoration";

    // Sun position
    sun.style.left = "29%";
    sun.style.top = "15%";
    sun.style.width = "8%";
    sun.style.height = "12%";
    sun.style.objectFit = "contain";

    placedObjects.appendChild(sun);

    return;
  }

  // Place Rocks in the ORANGE area
  if (item.id === "rocks") {

    if (!oasisPlaced || rocksPlaced >= 1) return;

    const rock = document.createElement("img");

    rock.src = "assets/Rocks_hiding_without_lizard1.png";
    rock.alt = "Desert rocks";
    rock.className = "placed";
    rock.dataset.itemId = "rocks";

    rock.style.left = "70%";
    rock.style.top = "66%";
    rock.style.width = "9%";
    rock.style.height = "9%";
    rock.style.objectFit = "contain";

    rock.addEventListener("mousedown", (event) => {
      startPlacedDrag(event, "rocks", rock);
    });

    placedObjects.appendChild(rock);

    rocksPlaced++;

    return;
  }

  // Place Sand in the BLUE area
  if (item.id === "sand") {

    const sand = document.createElement("img");

    sand.src = `assets/${item.image}`;
    sand.alt = "Sand";
    sand.className = "placed";
    sand.dataset.itemId = "sand";

    sand.style.left = "40%";
    sand.style.top = "68%";
    sand.style.width = "10%";
    sand.style.height = "9%";
    sand.style.objectFit = "contain";

    sand.addEventListener("mousedown", (event) => {
      startPlacedDrag(event, "sand", sand);
    });

    placedObjects.appendChild(sand);

    return;
  }

  // Place Mud in the GREEN area
  if (item.id === "mud") {

    const mud = document.createElement("img");

    mud.src = `assets/${item.image}`;
    mud.alt = "Mud";
    mud.className = "placed";
    mud.dataset.itemId = "mud";

    mud.style.left = "70%";
    mud.style.top = "58%";
    mud.style.width = "8%";
    mud.style.height = "8%";
    mud.style.objectFit = "contain";

    mud.addEventListener("mousedown", (event) => {
      startPlacedDrag(event, "mud", mud);
    });

    placedObjects.appendChild(mud);

    return;
  }
}

// Reset the scene
document.getElementById("resetButton").addEventListener("click", () => {

  placedObjects.innerHTML = "";

  oasisPlaced = false;
  rocksPlaced = 0;

  // Restore original desert background
  scene.classList.remove("oasis-active");

  // Restore original dry Ghaf tree
  document.getElementById("treeImage").src =
    "assets/Ghaf_tree_yellow_leaves8.png";

});

// Update arrow states when window size changes
window.addEventListener("resize", updateArrows);

// Initialize the tray
renderTray();
