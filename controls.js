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
  new Promise((resolve, reject) => {
    const sound = new Audio()
    sound.preload = true
    sound.addEventListener('canplaythrough', resolve)
    sound.addEventListener('error', reject)
    sound.src = sourceInputs[index]
  }).then(async () => {
    const p = await mixer.addSound(sourceInputs[index])
    inputElements[index].parentElement.classList.add('ready')
    inputElements[index].addEventListener('change', e => {
      if (e.currentTarget.checked) {
        mixer.play(index)
      } else {
        mixer.pause(index)
      }
    })
  }).catch(err => {
    console.log(err)
  })
})