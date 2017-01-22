const highlightColor = 'red'

const state = {
  currentImage: null,
  port: null
}

const isTag = (tagName) => (el) => el.tagName === tagName
const isImageTag = isTag('IMG')
const isBodyTag = isTag('BODY')

const isOtherImage = (first, second) => first.src !== second.src

const highlightOn = (target) => {
  target.style.setProperty("border", `1px solid ${highlightColor}`, "important")
}
const highlightOff = (target) => {
  target.style.setProperty("border", "none")
}

const handleMouseClick = (evt) => {
  const target = evt.target;
  if (!isImageTag(target)) {
    return;
  }

  state.port.postMessage({
    command: 'find',
    url: target.src
  });
}

const undetectImage = (target) => {
  highlightOff(target)
  state.currentImage = null;
  target.removeEventListener('click', handleMouseClick)
}

const detectImage = (target) => {
  highlightOn(target)
  state.currentImage = target;
  target.addEventListener('click', handleMouseClick)
}

const findImage = (target) => {
  const parent = target.parentElement

  if (!parent) {
    return false;
  }
  if (isBodyTag(parent)) {
    return false;
  }

  const firstChild = parent.children[0]
  if (!firstChild) {
    return false;
  }

  const firstImage = firstChild.children[0]
  if (!firstImage) {
    return false;
  }
  if (!isImageTag(firstImage)) {
    return false
  }

  return firstImage
}


const handleMouseMove = (event) => {
  const target = event.target
  const currentImage = state.currentImage;
  const isImage = isImageTag(target)

  if (!isImage) {
    if (currentImage) {
      undetectImage(currentImage)
    }

    const possibleImage = findImage(target)

    if (possibleImage) {
      detectImage(possibleImage)
    }

    return;
  }

  if (!currentImage) {
    detectImage(target)
    return;
  }

  if (isOtherImage(currentImage, target)) {
    highlightOn(target)
    highlightOff(currentImage)
    state.currentImage = target;
    return;
  }
}

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    if (msg.enabled) {
      document.addEventListener("mousemove", handleMouseMove, false);
    }
    if (!msg.enabled) {
      document.removeEventListener("mousemove", handleMouseMove);
    }
  });

  state.port = port
});
