const inputElements = Array.from(document.querySelectorAll('#AudioSources input'))
const sourceInputs = inputElements.map(i => {
  if (i.value.includes('element:', 0)) {
    const src = i.value.replace('element:', '')
    return document.getElementById(src) || null
  }
  if (i.value.includes('file:', 0)) {
    const src = i.value.replace('file:', '')
    return src || null
  }
})

inputElements.forEach((el, index) => {
  mixer.addSound(sourceInputs[index])
  el.addEventListener('change', e => {
    if (e.currentTarget.checked) {
      mixer.play(index)
    } else {
      mixer.pause(index)
    }
  })
})