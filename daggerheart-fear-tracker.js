/*
Module: Animated Slider Bar Overlay
Compatible with: Foundry VTT v12 and v13
*/

Hooks.once("init", () => {

  // Setting registration / Config setup
  game.settings.register("daggerheart-fear-tracker", "sliderImage", {
    name: "Slider Bar Image",
    hint: "Path to the slider bar PNG image (1000 x 30).",
    scope: "world",
    config: true,
    type: String,
    filePicker: "image",
    default: "modules/daggerheart-fear-tracker/images/slider.png"
  });

  game.settings.register("daggerheart-fear-tracker", "pipActiveImage", {
    name: "Activated Pip Image",
    hint: "Path to the activated pip PNG image (300 x 457).",
    scope: "world",
    config: true,
    type: String,
    filePicker: "image",
    default: "modules/daggerheart-fear-tracker/images/pip-active.png"
  });

  game.settings.register("daggerheart-fear-tracker", "pipInactiveImage", {
    name: "Deactivated Pip Image",
    hint: "Path to the deactivated pip PNG image. (300 x 457)",
    scope: "world",
    config: true,
    type: String,
    filePicker: "image",
    default: "modules/daggerheart-fear-tracker/images/pip-inactive.png"
  });

  game.settings.register("daggerheart-fear-tracker", "barPosition", {
    name: "Slider Bar Position",
    hint: "Display the bar at the top or bottom of the screen.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "top": "Top",
      "bottom": "Bottom"
    },
    default: "bottom",
    onChange: () => {
      updatePosition();
    }
  });

  // Slider visibility
  game.settings.register("daggerheart-fear-tracker", "barVisible", {
    name: "Slider Bar Visible",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // Init for pip counter
  game.settings.register("daggerheart-fear-tracker", "leftSideCount", {
    name: "Pip Count Left Side",
    scope: "world",
    config: false,
    type: Number,
    default: 12
  });

  // Option to change the number of fear tokens
  game.settings.register("daggerheart-fear-tracker", "maxFearTokens", {
    name: "Maximum number of fear tokens",
    hint: "This determines how many total tokens appear in the slider. Changing the number will reset the slider bar. RESTART REQURIED.",
    scope: "world",
    config: true,
    default: 12,
    type: Number,
    range: {
      min: 1,
      max: 30,
      step: 1,
    },
    onChange: () => {
      game.settings.set("daggerheart-fear-tracker", "leftSideCount", game.settings.get("daggerheart-fear-tracker", "maxFearTokens")),
      window.location.reload(); // easiest way to re-render the slider correctly
    },
  });

});

let container = null;

// Function to update the slider bar's position w/o restart
function updatePosition() {
  const position = game.settings.get("daggerheart-fear-tracker", "barPosition");
  if (!container) return;
  container.style.top = position === "top" ? "0" : "unset";
  container.style.bottom = position === "bottom" ? "0" : "unset";
  container.style.marginTop = position === "top" ? "40px" : "unset";
  container.style.marginBottom = position === "bottom" ? "55px" : "unset";
}

// Ensure that position is updated when config settings are saved
Hooks.on("closeSettingsConfig", () => {
  updatePosition();
});

Hooks.once("ready", () => {

  const isGM = game.user.isGM;

  // Remove existing slider bar if present
  const existing = document.getElementById("daggerheart-fear-tracker-container");
  if (existing) {
    console.warn("Removing existing slider container to prevent duplication.");
    existing.remove();
  }

  // Listener for updates
  game.socket.on("module.daggerheart-fear-tracker", (payload) => {
    //console.log("game.socket.on called for ", game.user.name);
    if (payload.type === "updatePips") {
      updatePips(payload.leftSideCount);
    }
    if (payload.type === "toggleVisibility") {
      const visible = game.settings.get("daggerheart-fear-tracker", "barVisible");
      //console.log("Setting visibility when slider value is", visible);
      container.style.opacity = !(visible) ? "1" : (game.user.isGM ? "0.5" : "0");
    }
  });

  // Testing
  //console.log("Fear tracker ready on ", game.user.name);

  // Create mother container and element containers
  container = document.createElement("div");
  container.id = "daggerheart-fear-tracker-container";
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.zIndex = 100;
  container.style.marginTop = "40px";
  container.style.display = "flex"; //game.settings.get("daggerheart-fear-tracker", "barVisible") ? "flex" : "none";
  container.style.justifyContent = "center";
  container.style.pointerEvents = "none";
  container.style.opacity = game.settings.get("daggerheart-fear-tracker", "barVisible") ? "1" : (isGM ? "0.5" : "0");

  //console.log("Ready to call updatePosition for the first time for ", game.user.name);
  updatePosition();

  const sliderWrapper = document.createElement("div");
  sliderWrapper.style.display = "flex";
  sliderWrapper.style.alignItems = "center";
  sliderWrapper.style.gap = "20px";
  sliderWrapper.style.position = "relative";
  sliderWrapper.style.pointerEvents = "auto";

  const slider = document.createElement("div");
  slider.id = "slider-bar";
  slider.style.backgroundImage = `url(${game.settings.get("daggerheart-fear-tracker", "sliderImage")})`;
  slider.style.backgroundSize = "contain";
  slider.style.backgroundRepeat = "no-repeat";
  slider.style.width = "1000px"; //1072
  slider.style.height = "50px";
  slider.style.marginLeft = "-15px";
  slider.style.marginRight = "-15px";
  slider.style.position = "relative";
  slider.style.display = "flex";

  //const totalPips = 12;
  const totalPips = game.settings.get("daggerheart-fear-tracker", "maxFearTokens");
  let leftSideCount = game.settings.get("daggerheart-fear-tracker", "leftSideCount");

  const pipInactive = game.settings.get("daggerheart-fear-tracker", "pipInactiveImage");
  const pipActive = game.settings.get("daggerheart-fear-tracker", "pipActiveImage");

  const pips = [];
  const pipContainer = document.createElement("div");
  pipContainer.style.position = "absolute";
  pipContainer.style.top = "0";
  pipContainer.style.left = "0";
  pipContainer.style.width = "100%";
  pipContainer.style.height = "100%";
  pipContainer.style.display = "flex";
  pipContainer.style.alignItems = "center";

  for (let i = 0; i < totalPips; i++) {
    const pipWrapper = document.createElement("div");
    pipWrapper.style.position = "absolute";
    pipWrapper.style.top = "10px";
    pipWrapper.style.width = "23px";
    pipWrapper.style.height = "30px";
    pipWrapper.style.transition = "left 1s ease";

    const inactiveImg = document.createElement("img");
    inactiveImg.src = pipInactive;
    inactiveImg.style.position = "absolute";
    inactiveImg.style.width = "23px";
    inactiveImg.style.height = "30px";
    inactiveImg.style.transition = "opacity 1s ease";
    inactiveImg.style.opacity = "1";
    inactiveImg.style.border = "none";
    inactiveImg.style.outline = "none";
    inactiveImg.style.backgroundColor = "transparent";
    inactiveImg.style.display = "block";

    const activeImg = document.createElement("img");
    activeImg.src = pipActive;
    activeImg.style.position = "absolute";
    activeImg.style.width = "23px";
    activeImg.style.height = "30px";
    activeImg.style.transition = "opacity 1s ease";
    activeImg.style.opacity = "0";
    activeImg.style.border = "none";
    activeImg.style.outline = "none";
    activeImg.style.backgroundColor = "transparent";
    activeImg.style.display = "block";
    activeImg.style.filter = "drop-shadow(0 0 6px rgba(253, 219, 82, 0.9))";

    pipWrapper.appendChild(inactiveImg);
    pipWrapper.appendChild(activeImg);
    pipContainer.appendChild(pipWrapper);
    pips.push({ wrapper: pipWrapper, inactiveImg, activeImg });
  }

  // News team: assemble!
  slider.appendChild(pipContainer);
  sliderWrapper.appendChild(slider);
  container.appendChild(sliderWrapper);
  document.body.appendChild(container);

  // Function to update token position when GM clicks + and - buttons
  function updatePips(count) {
    //console.log("updatePips called for user ", game.user.name);
    leftSideCount = count;
    const activeCount = totalPips - leftSideCount;
  
    for (let i = 0; i < totalPips; i++) {
      const pip = pips[i];
      const isActive = i >= leftSideCount;
      let targetLeft;
  
      if (isActive) {
        const activeIndex = i - leftSideCount;
        // Active pips start from (slider width - activeCount * spacing) // changed spacing from 34 to 28
        const startX = slider.clientWidth - (activeCount * 28) - 15; // additional to nudge the start to the left
        targetLeft = startX + (activeIndex * 28);
      } else {
        targetLeft = i * 28 + 15; // additional to nudge the start to the right
      }
  
      pip.wrapper.style.left = `${targetLeft}px`;
      pip.inactiveImg.style.opacity = isActive ? "0" : "1";
      pip.activeImg.style.opacity = isActive ? "1" : "0";
    }
  }

  slider.appendChild(pipContainer);
  updatePips(leftSideCount);

  // Add plus and minus buttons (GM only)
  const minus = document.createElement("img");
  minus.src = "modules/daggerheart-fear-tracker/images/minus.png";
  minus.style.width = "30px";
  minus.style.height = "30px";
  minus.style.flex = "0 0 auto";
  minus.style.border = "none";
  minus.style.outline = "none";
  minus.style.backgroundColor = "transparent";
  minus.style.display = "block";
  minus.style.cursor = "pointer";
  minus.addEventListener("click", () => {
    if (!isGM || leftSideCount >= totalPips) return;
    leftSideCount++;
    game.settings.set("daggerheart-fear-tracker", "leftSideCount", leftSideCount);
    updatePips(leftSideCount);
    game.socket.emit("module.daggerheart-fear-tracker", { type: "updatePips", leftSideCount });
  });

  const plus = document.createElement("img");
  plus.src = "modules/daggerheart-fear-tracker/images/plus.png";
  plus.style.width = "30px";
  plus.style.height = "30px";
  plus.style.flex = "0 0 auto";
  plus.style.border = "none";
  plus.style.outline = "none";
  plus.style.backgroundColor = "transparent";
  plus.style.display = "block";
  plus.style.cursor = "pointer";
  plus.addEventListener("click", () => {
    if (!isGM || leftSideCount <= 0) return;
    leftSideCount--;
    game.settings.set("daggerheart-fear-tracker", "leftSideCount", leftSideCount);
    updatePips(leftSideCount);
    game.socket.emit("module.daggerheart-fear-tracker", { type: "updatePips", leftSideCount });
  });

  // Add visibility toggle button (GM only)
  const eye = document.createElement("i");
  eye.className = game.settings.get("daggerheart-fear-tracker", "barVisible") ? "fas fa-eye" : "fas fa-eye-slash";
  eye.style.cursor = "pointer";
  eye.style.fontSize = "24px";
  eye.style.color = "white";
  eye.style.marginLeft = "8px";
  eye.style.flex = "0 0 auto";
  eye.addEventListener("click", () => {
    if (!isGM) return;
    const current = game.settings.get("daggerheart-fear-tracker", "barVisible");
    const newState = !current;
    //console.log("slider was ", current, ". Just set to ", newState);
    game.settings.set("daggerheart-fear-tracker", "barVisible", newState);
    //sliderWrapper.style.opacity = newState ? "1" : "0.5";
    container.style.opacity = newState ? "1" : "0.5";
    eye.className = newState ? "fas fa-eye" : "fas fa-eye-slash";
    game.socket.emit("module.daggerheart-fear-tracker", { type: "toggleVisibility" });
  });

  // Populate everything
  if (isGM) sliderWrapper.appendChild(minus);
  sliderWrapper.appendChild(slider);
  if (isGM) sliderWrapper.appendChild(plus);
  if (isGM) sliderWrapper.appendChild(eye);
  container.appendChild(sliderWrapper);
  document.body.appendChild(container);

});
