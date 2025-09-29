let state = {
  elevator: {
    clicks: 0,
    open: false,
  },
  elevatorButton: {
    clicks: 0,
  },
  rob: {
    animations: {},
    clicks: 0,
  },
};

const dialogue = {
  rob: {
    clicks: [
      {
        blocks: [
          "Hey...",
          "Hi there!",
          "Oh,",
          "I'm,",
          "uh,",
          "Rob.",
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
        blocks: [
          "Er...",
          "haha...",
          "It's hot isn't it?",
          "Yeah.",
          "Do you like elevators? I like them!",
          "Well it's my job, but...",
          "Well,",
          "I mean,",
          "it's not really",
          "*my",
          "job*",
          "my job.",
          "It's,",
          "uh...",
          "I'm here",
          "because Liv asked me to.",
          "Liv.",
          "She's the elevator girl.",
          "This hat is hers!",
        ],
        repeatable: false,
      },
      {
        blocks: ["I'm!", "At your service!!11!!"],
        repeatable: true,
      },
    ],
    elevatorButton: [
      {
        blocks: [
          "No",
          "no!",
          "It's",
          "okay!",
          "I'll",
          "press it for you!!",
          "!",
          "!",
          "...",
          "...",
          ".",
          ".",
          ".",
          "...oh...",
          "...",
          ".",
          ".",
          ".",
          "I'm,",
          "uh...",
          "stuck...",
          "here...",
        ],
      },
    ],
  },
};

function getDialogueForClicks(clicks, clicksDialogueArray) {
  let repeating = false;
  let availableDialogue = [];

  if (clicks > clicksDialogueArray.length) {
    repeating = true;
    for (let dialogue of clicksDialogueArray) {
      if (dialogue.repeatable) {
        availableDialogue.push(dialogue);
      }
    }
  } else {
    availableDialogue = clicksDialogueArray;
  }

  return availableDialogue[(clicks - 1) % availableDialogue.length];
}

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

async function writeDialogueToElement(
  element,
  textBlocks,
  delay = 0,
  blockSeparator = " "
) {
  element.textContent = "";
  for (const block of textBlocks) {
    element.textContent += block + blockSeparator;
    await wait(delay);
  }
}

async function processElevatorClick() {
  state.elevator.clicks++;

  if (state.elevator.open == false) {
    await playSequence(
      [
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/c34c83397b0e9f2c6a0ad3dfcae42b4040bebe18_elevator1.png",
        },
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/027bb41f085dc4f14cb496a83d1ba76ecb6fa519_elevator2.png",
        },
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/a19f90a757f667b8018f29841b917ac0de2e8d85_elevator3.png",
        },
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/042cf445c93e43aa24d96336747561a73f697963_elevator4.png",
        },
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
  state.elevatorButton.clicks += 1;
  elevatorMusic.pause();

  if (state.elevatorButton.clicks > 1) {
    await playSequence(
      [
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/3c81f6e1eebcf35f327c83ff7e72ac1eb1dc05f1_button2.png",
        },
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/e6091ab240a7511bc85e93ee458848960ebd1470_button1.png",
        },
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

    beep.play();
  } else {
    await showDialogue(
      "#rob-dialog",
      dialogue.rob.elevatorButton[0].blocks,
      300
    );
    elevatorMusic.play();
  }
}

async function processMapButtonClick() {
  dialog = document.querySelector("#map-dialog");
  console.log(dialog);
  dialog.showModal();
}

async function loopFunction(functionToLoop, timeoutVariable, loopDelay = 0) {
  clearTimeout(timeoutVariable);

  async function loop() {
    await functionToLoop();

    clearTimeout(timeoutVariable);
    timeoutVariable = setTimeout(loop, loopDelay);
  }

  loop();
}

async function loopRobSequence() {
  loopFunction(async () => {
    await playSequence(
      [
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/18b85cca673fb3c74ccfff96ca233f0167e6f8d7_rob1.png",
        },
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/c4535d53565885fe7e8cc4e4ef0e11832a717047_rob2.png",
        },
        {
          src: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/601ed47cdbcf1ef3a26c9ad240431f2f0ab4391b_rob3.png",
        },
      ],
      200,
      document.querySelector(".rob-img")
    );
  }, state.rob.animations.elevatorLoop);
}

async function processRobClick() {
  state.rob.clicks += 1;
  showDialogue(
    "#rob-dialog",
    getDialogueForClicks(state.rob.clicks, dialogue.rob.clicks).blocks,
    200
  );
}

async function showDialogue(
  dialogSelector,
  dialogueBlocks,
  delay = 0,
  textSelector = ".dialog-content"
) {
  dialog = document.querySelector(dialogSelector);
  dialogText = dialog.querySelector(textSelector);

  console.log("Open");
  dialog.showModal();
  await writeDialogueToElement(dialogText, dialogueBlocks, delay);
}
