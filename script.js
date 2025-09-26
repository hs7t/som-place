let state = {
  elevator: {
    clicks: 0,
    open: false,
  },
  rob: {
    animations: {},
  },
};

const dialogue = {
  rob: {
    clicks: [
      {
        blocks: [
          "Hey... Hi there!",
          "Oh,",
          "I'm,",
          "uh, Rob.",
          "Rob The Rock.",
          "Rob Rock!",
          "Haha...",
        ],
        repeatable: false,
      },
      {
        blocks: ["Me?", "Yeah,", "I mean...", "So...", "how's it going..."],
        repeatable: true,
      },
      {
        blocks: ["I'm!", "At your service!!11!!"],
        repeatable: true,
      },
      {
        blocks: [
          "Er...",
          "haha...",
          "It's hot isn't it?",
          "Yeah.",
          "Do you like elevators? I like them!",
          "Well it's my job, but...",
        ],
        repeatable: true,
      },
    ],
  },
};
let elevatorMusic = new Howl({
  src: ["audio/elevator.m4a"],
  loop: true,
  volume: 0.3,
  onend: function () {
    console.log("Stopped elevator music");
  },
});

let elevatorWhirr = new Howl({
  src: ["audio/elevator-whirr.m4a"],
  loop: true,
  volume: 1,
  onend: function () {
    console.log("Stopped elevator whirr");
  },
});

let beep = new Howl({
  src: ["audio/beep.m4a"],
  volume: 0.2,
  onend: function () {
    console.log("Ran beep");
  },
});

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hideElement(element) {
  element.classList.add("hidden");
  element.setAttribute("inert", true);
}

function showElement(element) {
  element.classList.remove("hidden");
  element.removeAttribute("inert");
}

function switchScene(oldScene, nextScene, onSceneSwitch = undefined) {
  hideElement(oldScene);
  Howler.stop();
  showElement(nextScene);

  if (onSceneSwitch != undefined) {
    onSceneSwitch();
  }
}

async function playSequence(
  frames = [],
  msTimeout = 100,
  element,
  onSequenceEnd = undefined
) {
  for (let frame of frames) {
    element.setAttribute("src", frame.src);
    await wait(msTimeout);
  }

  if (onSequenceEnd) {
    onSequenceEnd();
  }
}

async function processElevatorClick() {
  state.elevator.clicks++;

  if (state.elevator.open == false) {
    await playSequence(
      [
        { src: "sprites/elevator/elevator1.png" },
        { src: "sprites/elevator/elevator2.png" },
        { src: "sprites/elevator/elevator3.png" },
        { src: "sprites/elevator/elevator4.png" },
      ],
      100,
      document.querySelector(".elevator-img")
    );
    state.elevator.open = true;
  }

  await switchScene(
    document.querySelector(".start-section"),
    document.querySelector(".elevator-section"),
    loopRobSequence
  );
  elevatorMusic.play();
}

async function processElevatorButtonClick() {
  elevatorMusic.pause();

  beep.play();

  await playSequence(
    [
      { src: "sprites/elevator-button/button2.png" },
      { src: "sprites/elevator-button/button1.png" },
    ],
    200,
    document.querySelector(".elevator-button-img")
  );

  beep.on("end", () => {
    elevatorWhirr.play();
    document.querySelector(".elevator-section").classList.add("whirring");
  });

  elevatorWhirr.on("end", () => {
    document.querySelector(".elevator-section").classList.remove("whirring");
    switchScene(
      document.querySelector(".elevator-section"),
      document.querySelector(".start-section")
    );
  });
}

async function loopRobSequence() {
  clearTimeout(state.rob.animations.elevatorLoop);
  console.log("cleared timeout");

  async function loop() {
    await playSequence(
      [
        { src: "sprites/rob/rob1.png" },
        { src: "sprites/rob/rob2.png" },
        { src: "sprites/rob/rob3.png" },
      ],
      200,
      document.querySelector(".rob-img")
    );

    state.rob.animations.elevatorLoop = setTimeout(loop, 0);
    console.log("looped");
  }

  loop();
  console.log("registered loop");
}

async function processRobClick() {
  showDialog("#rob-dialog");
}

function showDialog(selector) {
  console.log("Open");
  document.querySelector(selector).showModal();
}
