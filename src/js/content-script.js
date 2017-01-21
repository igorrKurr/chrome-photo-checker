console.log('INIT')

const highlightColor = 'red'

const state = {
  currentImage: null
}

const isTag = (tagName) => (el) => el.tagName === tagName
const isImageTag = isTag('IMG')

const isOtherImage = (first, second) => first.src !== second.src

const highlightOn = (target) => {
  target.style.setProperty("border", `1px solid ${highlightColor}`, "important")
}
const highlightOff = (target) => {
  target.style.setProperty("border", "none")
}

const handleMouseMove = (event) => {
  const target = event.target
  const currentImage = state.currentImage;
  const isImage = isImageTag(target)

  if (!isImage) {
    if (currentImage) {
      highlightOff(currentImage)
      state.currentImage = null;
    }
    return;
  }

  if (!currentImage) {
    highlightOn(target)
    state.currentImage = target;
    return;
  }

  if (isOtherImage(currentImage, target)) {
    highlightOn(target)
    highlightOff(currentImage)
    state.currentImage = target;
    return;
  }
}

document.addEventListener("mousemove", handleMouseMove, false);
