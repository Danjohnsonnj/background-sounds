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

const loadPromises = []

inputElements.forEach((el, index) => {
  loadPromises.push(mixer.addSound(sourceInputs[index]))
})

Promise.all(loadPromises).then((results) => {
  results.forEach((result, i) => {
    inputElements[i].parentElement.classList.add('ready')
    inputElements[i].addEventListener('change', e => {
      if (e.currentTarget.checked) {
        mixer.play(i)
      } else {
        mixer.pause(i)
      }
    })
  })
})
