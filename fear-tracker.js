/*
Module: Fear Tracker for Foundry VTT
Compatible with: Foundry VTT v12 and v13
Copyright notice: This product includes materials from the Daggerheart System Reference Document 1.0 (https://www.daggerheart.com/wp-content/uploads/2025/05/DH-SRD-May202025.pdf), © Critical Role, LLC. All rights reserved. "Daggerheart" is a registered trademark of Darrington Press, LLC. Used under the Darrington Press Community Gaming License (https://darringtonpress.com/wp-content/uploads/2025/06/DPCGL-June-26-2025.pdf) with Foundry as a whitelisted VTT (https://darringtonpress.com/license/).
*/

Hooks.once("init", () => {

  // Setting registration / Config setup
  // mini or large
  game.settings.register("fear-tracker", "trackerSize", {
    name: "Fear Tracker Size",
    hint: "Choose between Large or Small (windowed mini) version of the tracker. Both versions are draggable and remember their positions on the screen. Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    choices: {
      large: "Large",
      small: "Small",
    },
    default: "large",
    onChange: value => {
      const existingMini = document.getElementById("mini-fear-tracker");
      const existingLarge = document.getElementById("fear-tracker-container");
      if (existingMini) existingMini.remove();
      if (existingLarge) existingLarge.remove();

      if (value === "large") {
        container = null;
        pips = [];
        slider = null;
        renderLargeTracker();
      } else {
        renderMiniTracker();
      }
    }
  });

  // mini version pip character
  game.settings.register("fear-tracker", "miniPipCharacter", {
    name: "Mini Tracker Pip Character",
    hint: "Change the mini tracker pip character. Applies only to you.",
    scope: "client",
    config: true,
    type: String,
    default: "\u25CF", // unicode black circle
    onChange: () => {
      const size = game.settings.get("fear-tracker", "trackerSize");
      const existingMini = document.getElementById("mini-fear-tracker");
      const existingLarge = document.getElementById("fear-tracker-container");
      if (existingMini) existingMini.remove();
      if (existingLarge) existingLarge.remove();

      if (size === "large") {
        container = null;
        pips = [];
        slider = null;
        renderLargeTracker();
      } else {
        renderMiniTracker();
      }
    }
  });

  // mini active pip color
  game.settings.register("fear-tracker", "miniColorActive", {
    name: "Mini Tracker Active Pip Color",
    hint: "Change the color of the active pips (fear) in the mini tracker. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#A02B93",
    onChange: () => {
      const size = game.settings.get("fear-tracker", "trackerSize");
      const existingMini = document.getElementById("mini-fear-tracker");
      const existingLarge = document.getElementById("fear-tracker-container");
      if (existingMini) existingMini.remove();
      if (existingLarge) existingLarge.remove();

      if (size === "large") {
        container = null;
        pips = [];
        slider = null;
        renderLargeTracker();
      } else {
        renderMiniTracker();
      }
    }
  });
  // mini inactive pip color
  game.settings.register("fear-tracker", "miniColorInactive", {
    name: "Mini Tracker Inactive Pip Color",
    hint: "Change the color of the inactive pips (not fear) in the mini tracker. Applies only to you.",
    scope: "client",
    config: true,
    type: new game.colorPicker.ColorPickerField(),
    default: "#C4C4C4",
    onChange: () => {
      const size = game.settings.get("fear-tracker", "trackerSize");
      const existingMini = document.getElementById("mini-fear-tracker");
      const existingLarge = document.getElementById("fear-tracker-container");
      if (existingMini) existingMini.remove();
      if (existingLarge) existingLarge.remove();

      if (size === "large") {
        container = null;
        pips = [];
        slider = null;
        renderLargeTracker();
      } else {
        renderMiniTracker();
      }
    }
  });

  // keep track of the tracker's position
  game.settings.register("fear-tracker", "miniTrackerPosition", {
    name: "Mini Tracker Position",
    scope: "client",
    config: false,
    type: Object,
    default: {top:100, left:100}
  });
  game.settings.register("fear-tracker", "largeTrackerPosition", {
    name: "Large Tracker Position",
    scope: "client",
    config: false,
    type: Object,
    default: {top:100, left:100}
  });
  
  game.settings.register("fear-tracker", "sliderImage", {
    name: "GM: Slider Bar Image",
    hint: "Path to the slider bar PNG image (1000 x 30). Applies to world.",
    scope: "world",
    config: true,
    type: String,
    filePicker: "image",
    default: "modules/fear-tracker/images/slider.png"
  });

  game.settings.register("fear-tracker", "pipActiveImage", {
    name: "GM: Activated Pip Image",
    hint: "Path to the activated pip PNG image (300 x 457). Applies to world.",
    scope: "world",
    config: true,
    type: String,
    filePicker: "image",
    default: "modules/fear-tracker/images/pip-active.png"
  });

  game.settings.register("fear-tracker", "pipInactiveImage", {
    name: "GM: Inactive Pip Image",
    hint: "Path to the inactive pip PNG image (300 x 457). Applies to world.",
    scope: "world",
    config: true,
    type: String,
    filePicker: "image",
    default: "modules/fear-tracker/images/pip-inactive.png"
  });

  // Slider visibility
  game.settings.register("fear-tracker", "barVisible", {
    name: "Slider Bar Visible",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  // Init for pip counter
  game.settings.register("fear-tracker", "leftSideCount", {
    name: "Pip Count Left Side",
    scope: "world",
    config: false,
    type: Number,
    default: 12,
    onChange: () => {
      game.settings.set("fear-tracker", "activeFear", game.settings.get("fear-tracker", "maxFearTokens") - game.settings.get("fear-tracker", "leftSideCount"));
    }
  });

  // Init for fear token number (used only for changing total number of tokens)
  game.settings.register("fear-tracker", "activeFear", {
    name: "Active Fear",
    scope: "world",
    config: false,
    type: Number,
    default: 0,
    onChange: (value) => {
      console.log("activeFear changed to", value);
    }
  });

  // Option to change the number of fear tokens
  game.settings.register("fear-tracker", "maxFearTokens", {
    name: "GM: Maximum number of fear tokens",
    hint: "This determines how many total tokens appear in the slider. To the extent possible, the current amount of fear will be preserved when this number is changed.",
    scope: "world",
    config: true,
    default: 12,
    type: Number,
    range: {
      min: 1,
      max: 30,
      step: 1,
    },
    onChange: (value) => {
      console.log("value", value);
      currentFear = game.settings.get("fear-tracker", "activeFear");
      if (currentFear > value) { // user has reduced the max number of tokens
        currentFear = value;
      } 
      
      console.log("else activeFear changed to", currentFear);
      newLeftSide = game.settings.get("fear-tracker", "maxFearTokens") - currentFear;
      console.log("leftSideCount changed to", newLeftSide);
      
      const size = game.settings.get("fear-tracker", "trackerSize");
      const existingMini = document.getElementById("mini-fear-tracker");
      const existingLarge = document.getElementById("fear-tracker-container");
      if (existingMini) existingMini.remove();
      if (existingLarge) existingLarge.remove();

      if (size === "large") {
        container = null;
        pips = [];
        slider = null;
        Promise.all([
          game.settings.set("fear-tracker", "activeFear", currentFear),
          game.settings.set("fear-tracker", "leftSideCount", newLeftSide)
        ]).then(() => {
          renderLargeTracker();
        });
      } else {
        Promise.all([
          game.settings.set("fear-tracker", "activeFear", currentFear),
          game.settings.set("fear-tracker", "leftSideCount", newLeftSide)
        ]).then(() => {
          renderMiniTracker();
        });
      }
    },
  });

});

let container = null;
let pips = [];
let slider = null;

// Drag function
function setupDrag(tracker) {
  let offset = { x: 0, y: 0 };
  const size = game.settings.get("fear-tracker", "trackerSize");

  function onMouseMove(event) {
    event.preventDefault();
    tracker.style.left = `${event.clientX - offset.x}px`;
    tracker.style.top = `${event.clientY - offset.y}px`;
  }

  function onMouseUp(event) { // MouseUp
    event.preventDefault();
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    // Save position to settings
    if (size === "small") {
      game.settings.set("fear-tracker", "miniTrackerPosition", {top: tracker.style.top, left: tracker.style.left} );
    } else {
      game.settings.set("fear-tracker", "largeTrackerPosition", {top: tracker.style.top, left: tracker.style.left} );
    }
  }

  function onMouseDown(event) {
    event.preventDefault();
    offset = {
      x: event.clientX - tracker.offsetLeft,
      y: event.clientY - tracker.offsetTop
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  tracker.addEventListener("mousedown", onMouseDown);
}

// Renderer for large tracker
function renderLargeTracker(render = true) {

  console.log("renderLargeTracker called");
  const isGM = game.user.isGM;
  const mode = game.settings.get("fear-tracker", "trackerSize");

  const pos = game.settings.get("fear-tracker", "largeTrackerPosition");
  console.log("pos", pos);
  
  // Create mother container and element containers
  container = document.createElement("div");
  container.id = "fear-tracker-container";
  container.style.position = "fixed";
  container.style.left = pos.left ? pos.left : "0";
  container.style.top = pos.top ? pos.top : "0";
  container.style.width = "100%";
  container.style.zIndex = 100;
  container.style.marginTop = "0px";
  container.style.display = mode === "small" ? "none" : "flex"; // don't display if small mode is selected (probably deprecated, can be "flex" most likely)
  container.style.justifyContent = "center";
  container.style.pointerEvents = "none";
  container.style.opacity = game.settings.get("fear-tracker", "barVisible") ? "1" : (isGM ? "0.5" : "0");
  container.draggable = true;

  const sliderWrapper = document.createElement("div");
  sliderWrapper.style.display = "flex";
  sliderWrapper.style.alignItems = "center";
  sliderWrapper.style.gap = "20px";
  sliderWrapper.style.position = "relative";
  sliderWrapper.style.pointerEvents = "auto";

  slider = document.createElement("div");
  slider.id = "slider-bar";
  slider.style.backgroundImage = `url(${game.settings.get("fear-tracker", "sliderImage")})`;
  slider.style.backgroundSize = "contain";
  slider.style.backgroundRepeat = "no-repeat";
  slider.style.width = "1000px"; //1072
  slider.style.height = "50px";
  slider.style.marginLeft = "-15px";
  slider.style.marginRight = "-15px";
  slider.style.position = "relative";
  slider.style.display = "flex";
  slider.style.cursor = "move";

  const totalPips = game.settings.get("fear-tracker", "maxFearTokens");
  let leftSideCount = game.settings.get("fear-tracker", "leftSideCount");

  const pipInactive = game.settings.get("fear-tracker", "pipInactiveImage");
  const pipActive = game.settings.get("fear-tracker", "pipActiveImage");

  //const pips = [];
  const pipContainer = document.createElement("div");
  pipContainer.style.position = "absolute";
  pipContainer.style.top = "0";
  pipContainer.style.left = "0";
  pipContainer.style.width = "100%";
  pipContainer.style.height = "100%";
  pipContainer.style.display = "flex";
  pipContainer.style.alignItems = "center";

  for (let i = 0; i < totalPips; i++) {
    //console.log("inside pipBuilder for loop");
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

  // Add plus and minus buttons (GM only)
  const minus = document.createElement("img");
  minus.src = "modules/fear-tracker/images/minus.png";
  minus.style.width = "30px";
  minus.style.height = "30px";
  minus.style.flex = "0 0 auto";
  minus.style.border = "none";
  minus.style.outline = "none";
  minus.style.backgroundColor = "transparent";
  minus.style.display = "block";
  minus.style.cursor = "pointer";
  minus.onclick = () => { //addEventListener("click", () => {
    if (!isGM || leftSideCount >= totalPips) return;
    leftSideCount++;
    game.settings.set("fear-tracker", "leftSideCount", leftSideCount);
    updatePips(leftSideCount);
    game.socket.emit("module.fear-tracker", { type: "updatePips", leftSideCount });
  };

  const plus = document.createElement("img");
  plus.src = "modules/fear-tracker/images/plus.png";
  plus.style.width = "30px";
  plus.style.height = "30px";
  plus.style.flex = "0 0 auto";
  plus.style.border = "none";
  plus.style.outline = "none";
  plus.style.backgroundColor = "transparent";
  plus.style.display = "block";
  plus.style.cursor = "pointer";
  plus.onclick = () => {
    if (!isGM || leftSideCount <= 0) return;
    leftSideCount--;
    game.settings.set("fear-tracker", "leftSideCount", leftSideCount);
    updatePips(leftSideCount);
    game.socket.emit("module.fear-tracker", { type: "updatePips", leftSideCount });
  };

  // Add visibility toggle button (GM only)
  const eye = document.createElement("i");
  eye.className = game.settings.get("fear-tracker", "barVisible") ? "fas fa-eye" : "fas fa-eye-slash";
  eye.style.cursor = "pointer";
  eye.style.fontSize = "24px";
  eye.style.color = "white";
  eye.style.marginLeft = "8px";
  eye.style.flex = "0 0 auto";
  eye.onclick = () => {
    if (!isGM) return;
    const current = game.settings.get("fear-tracker", "barVisible");
    const newState = !current;
    //console.log("slider was ", current, ". Just set to ", newState);
    game.settings.set("fear-tracker", "barVisible", newState);
    container.style.opacity = newState ? "1" : "0.5";
    eye.className = newState ? "fas fa-eye" : "fas fa-eye-slash";
    game.socket.emit("module.fear-tracker", { type: "toggleVisibility" });
  };

  // Populate everything
  slider.appendChild(pipContainer);
  if (isGM) sliderWrapper.appendChild(minus);
  sliderWrapper.appendChild(slider);
  if (isGM) sliderWrapper.appendChild(plus);
  if (isGM) sliderWrapper.appendChild(eye);
  container.appendChild(sliderWrapper);

  // reapply position
  //const pos = game.settings.get("fear-tracker", "largeTrackerPosition");
  container.style.top = pos.top; 
  container.style.left = pos.left; 

  setupDrag(container);

  document.body.appendChild(container);
  updatePips(leftSideCount);
  
  //return {pips, slider}; 
}

// Function to render mini tracker
function renderMiniTracker() {

  console.log("renderMiniTracker called");
  const isGM = game.user.isGM;
  
  const tracker = document.createElement("div");
  tracker.id = "mini-fear-tracker";
  tracker.style.position = "fixed";
  tracker.style.background = "rgba(0, 0, 0, 0.75)";
  tracker.style.border = "1px solid #555";
  tracker.style.padding = "5px";
  tracker.style.zIndex = 100;
  tracker.style.fontSize = "20px";
  tracker.style.cursor = "move";
  tracker.style.display = "flex";
  tracker.style.alignItems = "center";
  tracker.style.gap = "6px";
  tracker.draggable = true;

  leftSideCount = game.settings.get("fear-tracker", "leftSideCount");
  const pipChar = game.settings.get("fear-tracker", "miniPipCharacter");
  const activeColor = game.settings.get("fear-tracker", "miniColorActive");
  const inactiveColor = game.settings.get("fear-tracker", "miniColorInactive");
  const totalPips = game.settings.get("fear-tracker", "maxFearTokens");
  const activeCount = totalPips - leftSideCount;

  // minus button (GM only)
  if (isGM) {
    const minus = document.createElement("img");
    minus.src = "modules/fear-tracker/images/minus.png";
    minus.style.width = "16px";
    minus.style.height = "16px";
    minus.style.marginTop = "2px";
    minus.style.cursor = "pointer";
    minus.style.border = "none";
    minus.style.outline = "none";
    minus.style.backgroundColor = "transparent";
    minus.onclick = () => {
      console.log("mini tracker minus click!");
      if (leftSideCount < totalPips) {
        leftSideCount++;
        game.settings.set("fear-tracker", "leftSideCount", leftSideCount);
        updatePips(leftSideCount);
        game.socket.emit("module.fear-tracker", { type: "updatePips", leftSideCount });
      }
    };
    tracker.appendChild(minus);
  }

  // Pips
  const pipWrapper = document.createElement("div");
  pipWrapper.id = "mini-tracker-pips"; // to enable deletion and re-insertion upon update
  for (let i = 0; i < totalPips; i++) {
    const pip = document.createElement("span");
    pip.textContent = pipChar;
    pip.style.fontSize = "20px";
    pip.style.margin = "0 2px";
    pip.style.color = i >= leftSideCount ? activeColor : inactiveColor;
    pipWrapper.appendChild(pip);
  }
  tracker.appendChild(pipWrapper);

  // plus button (GM only)
  if (isGM) {
    const plus = document.createElement("img");
    plus.src = "modules/fear-tracker/images/plus.png";
    plus.style.width = "16px";
    plus.style.height = "16px";
    plus.style.marginTop = "2px";
    plus.style.cursor = "pointer";
    plus.style.border = "none";
    plus.style.outline = "none";
    plus.style.backgroundColor = "transparent";
    plus.onclick = () => {
      console.log("mini tracker plus click!");
      if (leftSideCount > 0) {
        leftSideCount--;
        game.settings.set("fear-tracker", "leftSideCount", leftSideCount);
        updatePips(leftSideCount);
        game.socket.emit("module.fear-tracker", { type: "updatePips", leftSideCount });
      }
    };
    tracker.appendChild(plus);
  }

  // Add visibility toggle button (GM only)
  if (isGM) {
    const eye = document.createElement("i");
    eye.className = game.settings.get("fear-tracker", "barVisible") ? "fas fa-eye" : "fas fa-eye-slash";
    eye.style.cursor = "pointer";
    eye.style.fontSize = "16px";
    eye.style.color = "white";
    eye.style.marginLeft = "4px";
    eye.style.flex = "0 0 auto";
    eye.style.marginTop = "2px";
    eye.onclick = () => {
      if (!isGM) return;
      const current = game.settings.get("fear-tracker", "barVisible");
      const newState = !current;
      //console.log("slider was ", current, ". Just set to ", newState);
      game.settings.set("fear-tracker", "barVisible", newState);
      tracker.style.opacity = newState ? "1" : "0.5";
      eye.className = newState ? "fas fa-eye" : "fas fa-eye-slash";
      game.socket.emit("module.fear-tracker", { type: "toggleVisibility" });
    };
    tracker.appendChild(eye);
  }

  // Load position
  const pos = game.settings.get("fear-tracker", "miniTrackerPosition");
  tracker.style.top = pos.top; 
  tracker.style.left = pos.left; 

  setupDrag(tracker);

  document.body.appendChild(tracker);

  updatePips(leftSideCount);
  
}
// End mini tracker render function


// Function to update tokens/pips position when GM clicks + and - buttons
function updatePips(count) {  
  leftSideCount = count;
  const totalPips = game.settings.get("fear-tracker", "maxFearTokens");
  const activeCount = totalPips - leftSideCount;
  const mode = game.settings.get("fear-tracker", "trackerSize");

  if (mode === "small") {
    const pipChar = game.settings.get("fear-tracker", "miniPipCharacter");
    const activeColor = game.settings.get("fear-tracker", "miniColorActive");
    const inactiveColor = game.settings.get("fear-tracker", "miniColorInactive");
      
    const container = document.getElementById("mini-fear-tracker");
    if (!container) return;

    // Clear old pips
    const pipWrapper = document.getElementById("mini-tracker-pips");
    if (pipWrapper) pipWrapper.innerHTML = "";

    for (let i = 0; i < totalPips; i++) {
      const pip = document.createElement("span");
      pip.innerText = pipChar;
      pip.style.fontSize = "20px";
      pip.style.margin = "0 2px";
      pip.style.color = i >= leftSideCount ? activeColor : inactiveColor;
      pipWrapper.appendChild(pip);
    }
  } else {
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
}

Hooks.once("ready", () => {

  const isGM = game.user.isGM;

  // Remove existing slider bar if present
  const existing = document.getElementById("fear-tracker-container");
  if (existing) {
    console.warn("Removing existing slider container to prevent duplication.");
    existing.remove();
  }

  // render correct tracker based on client setting
  const mode = game.settings.get("fear-tracker", "trackerSize");
  if (mode === "small") {
    console.log("rendering mini tracker");
    renderMiniTracker();
    //renderLargeTracker(); // but it will be invisible
  } else { // render large one
    console.log("rendering large tracker");
    renderLargeTracker();
  }

  // Listener for updates
  game.socket.on("module.fear-tracker", (payload) => {
    //console.log("game.socket.on called for ", game.user.name);
    if (payload.type === "updatePips") {
      updatePips(payload.leftSideCount);
    }
    if (payload.type === "toggleVisibility") {
      const visible = game.settings.get("fear-tracker", "barVisible");
      const size = game.settings.get("fear-tracker", "trackerSize");
      //console.log("Setting visibility when slider value is", visible);
      existingLarge = document.getElementById("fear-tracker-container"); //container.style.opacity = !(visible) ? "1" : (game.user.isGM ? "0.5" : "0");
      existingMini = document.getElementById("mini-fear-tracker");
      if (existingLarge) existingLarge.style.opacity = !(visible) ? "1" : (game.user.isGM ? "0.5" : "0");
      if (existingMini) existingMini.style.opacity = !(visible) ? "1" : (game.user.isGM ? "0.5" : "0");
    }
  });
  
  // Testing
  //console.log("Fear tracker ready on ", game.user.name);

});
