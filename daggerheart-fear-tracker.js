/*
Module: Animated Slider Bar Overlay
Compatible with: Foundry VTT v12 and v13
*/

Hooks.once("init", () => {
  game.settings.register("daggerheart-fear-tracker", "sliderImage", {
    name: "Slider Bar Image",
    hint: "Path to the slider bar PNG image.",
    scope: "world",
    config: true,
    type: String,
    default: "modules/daggerheart-fear-tracker/images/slider.png"
  });

  game.settings.register("daggerheart-fear-tracker", "pipActiveImage", {
    name: "Activated Pip Image",
    hint: "Path to the activated pip PNG image.",
    scope: "world",
    config: true,
    type: String,
    default: "modules/daggerheart-fear-tracker/images/pip-active.png"
  });

  game.settings.register("daggerheart-fear-tracker", "pipInactiveImage", {
    name: "Deactivated Pip Image",
    hint: "Path to the deactivated pip PNG image.",
    scope: "world",
    config: true,
    type: String,
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
    default: "bottom"
  });

  game.settings.register("daggerheart-fear-tracker", "barVisible", {
    name: "Slider Bar Visible",
    scope: "world",
    config: false,
    type: Boolean,
    default: true
  });

  game.settings.register("daggerheart-fear-tracker", "leftSideCount", {
    name: "Pip Count Left Side",
    scope: "world",
    config: false,
    type: Number,
    default: 12
  });
});

Hooks.once("ready", () => {
  game.socket.on("module.daggerheart-fear-tracker", (payload) => {
    if (payload.type === "updatePips") {
      updatePips(payload.leftSideCount);
    }
    if (payload.type === "toggleVisibility") {
      const visible = game.settings.get("daggerheart-fear-tracker", "barVisible");
      //container.style.display = visible ? "flex" : "none";
      //sliderWrapper.style.opacity = visible ? "1" : "0";
      //container.style.opacity = visible && game.user.isGM ? "1" : "0";
      sliderWrapper.style.opacity = visible ? "1" : (game.user.isGM ? "0.5" : "0");
    }
  });

  const isGM = game.user.isGM;

  const container = document.createElement("div");
  container.id = "daggerheart-fear-tracker-container";
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.width = "100%";
  container.style.zIndex = 100;
  container.style.display = game.settings.get("daggerheart-fear-tracker", "barVisible") ? "flex" : "none";
  container.style.justifyContent = "center";
  container.style.pointerEvents = "none";

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
  slider.style.width = "1072px";
  slider.style.height = "50px";
  slider.style.position = "relative";
  slider.style.display = "flex";
  slider.style.alignItems = "center";
  slider.style.pointerEvents = "auto";

  const totalPips = 12;
  let leftSideCount = game.settings.get("daggerheart-fear-tracker", "leftSideCount");

  const pipInactive = game.settings.get("daggerheart-fear-tracker", "pipInactiveImage");
  const pipActive = game.settings.get("daggerheart-fear-tracker", "pipActiveImage");

  const pips = [];
  const pipContainer = document.createElement("div");
  pipContainer.style.display = "flex";
  pipContainer.style.position = "absolute";
  pipContainer.style.left = "10px";
  pipContainer.style.gap = "4px";

  for (let i = 0; i < totalPips; i++) {
    const pip = document.createElement("img");
    pip.style.transition = "all 0.3s ease";
    pip.style.width = pip.style.height = "30px";
    pips.push(pip);
    pipContainer.appendChild(pip);
  }

  function updatePips(count) {
    leftSideCount = count;
    for (let i = 0; i < totalPips; i++) {
      if (i < leftSideCount) {
        pips[i].src = pipInactive;
      } else {
        pips[i].src = pipActive;
      }
    }
  }

  updatePips(leftSideCount);
  slider.appendChild(pipContainer);

  const minus = document.createElement("img");
  minus.src = "modules/daggerheart-fear-tracker/images/minus.png";
  minus.style.width = "30px";
  minus.style.height = "30px";
  minus.style.flex = "0 0 auto";
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
  plus.style.cursor = "pointer";
  plus.addEventListener("click", () => {
    if (!isGM || leftSideCount <= 0) return;
    leftSideCount--;
    game.settings.set("daggerheart-fear-tracker", "leftSideCount", leftSideCount);
    updatePips(leftSideCount);
    game.socket.emit("module.daggerheart-fear-tracker", { type: "updatePips", leftSideCount });
  });

  const eye = document.createElement("i");
  eye.className = "fas fa-eye";
  eye.style.cursor = "pointer";
  eye.style.fontSize = "24px";
  eye.style.color = "white";
  eye.style.marginLeft = "8px";
  eye.style.flex = "0 0 auto";
  eye.addEventListener("click", () => {
    if (!isGM) return;
    const current = game.settings.get("daggerheart-fear-tracker", "barVisible");
    const newState = !current;
    game.settings.set("daggerheart-fear-tracker", "barVisible", newState);
    sliderWrapper.style.opacity = newState ? "1" : "0.5";
    eye.className = newState ? "fas fa-eye" : "fas fa-eye-slash";
    game.socket.emit("module.daggerheart-fear-tracker", { type: "toggleVisibility" });
  });

  sliderWrapper.appendChild(minus);
  sliderWrapper.appendChild(slider);
  sliderWrapper.appendChild(plus);
  if (isGM) sliderWrapper.appendChild(eye);
  container.appendChild(sliderWrapper);
  document.body.appendChild(container);

  if (isGM) addGMControls();



  function updatePosition() {
    container.style.top = game.settings.get("daggerheart-fear-tracker", "barPosition") === "top" ? "0" : "unset";
    container.style.bottom = game.settings.get("daggerheart-fear-tracker", "barPosition") === "bottom" ? "0" : "unset";
  }
});
