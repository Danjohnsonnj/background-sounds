
window.AudioContext = window.AudioContext || window.webkitAudioContext
const loadAndPlaySound = function(url) {
  const audioCtx = new AudioContext()
  let soundBuffer = null

  function loadSound(url) {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    
    request.onload = () => {
      audioCtx.decodeAudioData(request.response, buffer => {
        soundBuffer = buffer
        playLoadedSound(soundBuffer)
      })
    }
    request.send()
  }
  
  function playLoadedSound(buffer) {
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.connect(audioCtx.destination)
    source.start(0)
  }

  loadSound(url)
}
// loadAndPlaySound('./audio/thunder-1.m4a')

const playSoundFromElement = function(audioEl) {
  if (!(audioEl instanceof HTMLAudioElement)) {
    console.error(new Error(`${audioEl} is not an HTMLAudioElement`))
    return
}
  const audioCtx = new AudioContext()
  const source = audioCtx.createMediaElementSource(audioEl)
  const gainNode = audioCtx.createGain()
  source.connect(gainNode)
  gainNode.gain.value = 1
  gainNode.connect(audioCtx.destination)
  source.mediaElement.play()
  return audioCtx
}
// playSoundFromElement(document.querySelector('audio'))

class Mixer {
  constructor() {
    this.AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioCtx = new this.AudioContext()
    this.sources = []
  }

  addSound(audioEl) {
    if (!(audioEl instanceof HTMLAudioElement)) {
      console.error(new Error(`${audioEl} is not an HTMLAudioElement`))
      return
    }
    const source = this.audioCtx.createMediaElementSource(audioEl)
    const gainNode = this.audioCtx.createGain()
    source.connect(gainNode)
    gainNode.gain.value = audioEl.getAttribute('volume') || 1
    gainNode.connect(this.audioCtx.destination)
    this.sources.push(source)
    return this.audioCtx
  }

  play(index = null) {
    if (index && this.sources[index]) {
      this.sources[index].mediaElement.play()
      return this.sources[index]
    }
    this.sources.forEach(s => {
      s.mediaElement.play()
    })
    return this.sources
  }

  pause(index = null) {
    if (index && this.sources[index]) {
      this.sources[index].mediaElement.pause()
      return this.sources[index]
    }
    this.sources.forEach(s => {
      s.mediaElement.pause()
    })
    return this.sources
  }
}
const mixer = new Mixer()
Array.from(document.querySelectorAll('audio')).forEach(audio => {
  mixer.addSound(audio)
})