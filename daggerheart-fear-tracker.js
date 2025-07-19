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

  const existing = document.getElementById("daggerheart-fear-tracker-container");
  if (existing) {
    console.warn("Removing existing slider container to prevent duplication.");
    existing.remove();
  }

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
  slider.style.width = "1000px"; //1072
  slider.style.height = "50px";
  slider.style.marginLeft = "-15px";
  slider.style.marginRight = "-15px";
  slider.style.position = "relative";
  slider.style.display = "flex";
  //slider.style.alignItems = "center";
  //slider.style.pointerEvents = "auto";

  const totalPips = 12;
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
    //pipWrapper.style.top = "50%";
    //pipWrapper.style.transform = "translateY(-50%)";
    pipWrapper.style.width = "30px";
    pipWrapper.style.height = "30px";
    pipWrapper.style.transition = "left 1s ease";

    const inactiveImg = document.createElement("img");
    inactiveImg.src = pipInactive;
    inactiveImg.style.position = "absolute";
    inactiveImg.style.width = "30px";
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
    activeImg.style.width = "30px";
    activeImg.style.height = "30px";
    activeImg.style.transition = "opacity 1s ease";
    activeImg.style.opacity = "0";
    activeImg.style.border = "none";
    activeImg.style.outline = "none";
    activeImg.style.backgroundColor = "transparent";
    activeImg.style.display = "block";

    pipWrapper.appendChild(inactiveImg);
    pipWrapper.appendChild(activeImg);
    pipContainer.appendChild(pipWrapper);
    pips.push({ wrapper: pipWrapper, inactiveImg, activeImg });
  }

  slider.appendChild(pipContainer);
  
  sliderWrapper.appendChild(slider);
  //const sliderBarWrapper = document.createElement("div");
  //sliderBarWrapper.style.position = "relative";  // or static
  //sliderBarWrapper.style.marginTop = "40px";     // push slider bar down
  //sliderBarWrapper.appendChild(slider);
  //sliderWrapper.appendChild(sliderBarWrapper);
  
  container.appendChild(sliderWrapper);
  document.body.appendChild(container);

  function updatePips(count) {
    leftSideCount = count;
    const activeCount = totalPips - leftSideCount;
  
    for (let i = 0; i < totalPips; i++) {
      const pip = pips[i];
      const isActive = i >= leftSideCount;
      let targetLeft;
  
      if (isActive) {
        const activeIndex = i - leftSideCount;
        // Active pips start from (slider width - activeCount * spacing)
        const startX = slider.clientWidth - (activeCount * 34) - 20; // additional to nudge the start to the left
        targetLeft = startX + (activeIndex * 34);
      } else {
        targetLeft = i * 34 + 20; // additional to nudge the start to the right
      }
  
      pip.wrapper.style.left = `${targetLeft}px`;
      pip.inactiveImg.style.opacity = isActive ? "0" : "1";
      pip.activeImg.style.opacity = isActive ? "1" : "0";
    }
  }

  slider.appendChild(pipContainer);
  updatePips(leftSideCount);

  game.socket.on("module.daggerheart-fear-tracker", (payload) => {
    if (payload.type === "updatePips") {
      updatePips(payload.leftSideCount);
    }
    if (payload.type === "toggleVisibility") {
      const visible = game.settings.get("daggerheart-fear-tracker", "barVisible");
      sliderWrapper.style.opacity = visible ? "1" : (game.user.isGM ? "0.5" : "0");
    }
  });

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

  function addGMControls() {
    class ToggleOverlayMenu extends FormApplication {
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          title: "Toggle Slider Visibility",
          id: "toggle-overlay-menu",
          template: "templates/forms/default.html",
          width: 400
        });
      }

      getData() {
        return {
          isVisible: game.settings.get("daggerheart-fear-tracker", "barVisible")
        };
      }

      async _updateObject(event, formData) {
        const current = game.settings.get("daggerheart-fear-tracker", "barVisible");
        await game.settings.set("daggerheart-fear-tracker", "barVisible", !current);
        ui.notifications.info('Slider visibility set to: ${!current}');
        location.reload();
      }
    }

    //game.settings.registerMenu("daggerheart-fear-tracker", "toggleVisibility", {
    //  name: "Toggle Slider Overlay",
    //  label: "Toggle Visibility",
    //  hint: "GM only visibility toggle",
    //  icon: "fas fa-eye",
    //  type: ToggleOverlayMenu,
    //  restricted: true
    //});
  }

  function updatePosition() {
    container.style.top = game.settings.get("daggerheart-fear-tracker", "barPosition") === "top" ? "0" : "unset";
    container.style.bottom = game.settings.get("daggerheart-fear-tracker", "barPosition") === "bottom" ? "0" : "unset";
  }
});
