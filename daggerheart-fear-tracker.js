/*
Module: Daggerheart Fear Tracker
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
    default: "modules/sdaggerheart-fear-tracker/images/pip-active.png"
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

  const slider = document.createElement("div");
  slider.id = "slider-bar";
  slider.style.backgroundImage = `url(${game.settings.get("daggerheart-fear-tracker", "sliderImage")})`;
  slider.style.backgroundSize = "contain";
  slider.style.backgroundRepeat = "no-repeat";
  slider.style.width = "800px";
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
  pipContainer.style.left = "50px";
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
      pips[i].src = i < leftSideCount ? pipInactive : pipActive;
    }
  }

  updatePips(leftSideCount);

  slider.appendChild(pipContainer);

  const minus = document.createElement("img");
  minus.src = "modules/daggerheart-fear-tracker/images/minus.png";
  minus.style.width = minus.style.height = "30px";
  minus.style.marginRight = "10px";
  minus.style.cursor = "pointer";
  minus.addEventListener("click", () => {
    if (!isGM || leftSideCount >= totalPips) return;
    leftSideCount++;
    game.settings.set("daggerheart-fear-tracker", "leftSideCount", leftSideCount);
    game.socket.emit("module.daggerheart-fear-tracker", { type: "updatePips", leftSideCount });
  });

  const plus = document.createElement("img");
  plus.src = "modules/daggerheart-fear-tracker/images/plus.png";
  plus.style.width = plus.style.height = "30px";
  plus.style.marginLeft = "10px";
  plus.style.cursor = "pointer";
  plus.addEventListener("click", () => {
    if (!isGM || leftSideCount <= 0) return;
    leftSideCount--;
    game.settings.set("daggerheart-fear-tracker", "leftSideCount", leftSideCount);
    game.socket.emit("module.daggerheart-fear-tracker", { type: "updatePips", leftSideCount });
  });

  slider.prepend(minus);
  slider.appendChild(plus);

  container.appendChild(slider);
  document.body.appendChild(container);

  if (isGM) addGMControls();

  function addGMControls() {
    const toggleButton = new Dialog({
      title: "Toggle Slider Visibility",
      content: "<p>Toggle slider bar for all users?</p>",
      buttons: {
        toggle: {
          label: "Toggle",
          callback: () => {
            const current = game.settings.get("daggerheart-fear-tracker", "barVisible");
            game.settings.set("daggerheart-fear-tracker", "barVisible", !current);
            container.style.display = !current ? "flex" : "none";
          }
        },
        close: {
          label: "Close"
        }
      },
      default: "close"
    });

    game.settings.registerMenu("daggerheart-fear-tracker", "toggleVisibility", {
      name: "Toggle Slider Overlay",
      label: "Toggle Visibility",
      hint: "GM only visibility toggle",
      icon: "fas fa-eye",
      type: class {
        static renderDialog() {
          toggleButton.render(true);
        }
      },
      restricted: true
    });
  }

  function updatePosition() {
    container.style.top = game.settings.get("daggerheart-fear-tracker", "barPosition") === "top" ? "0" : "unset";
    container.style.bottom = game.settings.get("daggerheart-fear-tracker", "barPosition") === "bottom" ? "0" : "unset";
  }
});
