class Mixer {
  constructor() {
    this.AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioCtx = new this.AudioContext()
    this.sources = []
    this.buffers = []
    this.count = 0
  }

  async addSound(src) {
    if (src instanceof HTMLAudioElement) {
      console.log(`${src} added`)
      return await this.addSoundFromElement(src)
    }
    if (typeof src === 'string') {
      console.log(`${src} added`)
      return await this.addSoundFromURL(src)
    }
    console.error(new Error(`${src} is not an HTMLAudioElement`))
    return
  }
  
  addSoundFromElement(audioEl) {
    const index = this.count
    this.count++
    const source = this.audioCtx.createMediaElementSource(audioEl)
    source.mediaElement.loop = true
    const gainNode = this.audioCtx.createGain()
    source.connect(gainNode)
    gainNode.gain.value = audioEl.getAttribute('volume') || 1
    gainNode.connect(this.audioCtx.destination)

    this.buffers[index] = null
    this.sources[index] = source
    return source
  }

  async addSoundFromURL(url) {
    const index = this.count
    this.count++
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    const source = await new Promise((resolve, reject) => {
      request.onload = () => {
        this.audioCtx.decodeAudioData(request.response, buffer => {
          resolve(buffer)
        })
      }
      request.onerror = err => {
        reject(err)
      }
      request.send()
    })

    this.buffers[index] = source
    this.sources[index] = null
    return source
  }

  playByType(index) {
    const src = this.buffers[index] || this.sources[index]
    if (src instanceof AudioBuffer) {
      const source = this.audioCtx.createBufferSource()
      source.buffer = src
      source.loop = true
      source.connect(this.audioCtx.destination)  
      source.start()
      this.sources[index] = source
    } else if (src instanceof MediaElementAudioSourceNode){
      src.mediaElement.play()
    } else {
      console.error(`${src} is not a supported type`)
    }
  }

  pauseByType(index) {
    const src = this.buffers[index] || this.sources[index]
    if (src instanceof AudioBuffer) {
      this.sources[index].disconnect()
      this.sources[index] = null
    } else if (src instanceof MediaElementAudioSourceNode){
      src.mediaElement.pause()
      src.mediaElement.currentTime = 0
    } else {
      console.error(`${src} is not a supported type`)
    }
  }

  play(index = null) {
    if (typeof index === 'number') {
      this.playByType(index)
      return
    }
    this.sources.forEach((s, idx) => {
      this.playByType(idx)
    })
    return this.sources
  }

  pause(index = null) {
    if (typeof index === 'number') {
      this.pauseByType(index)
      return
    }
    this.sources.forEach((s, idx) => {
      this.pauseByType(idx)
    })
    return this.sources
  }
}
const mixer = new Mixer()
// Array.from(document.querySelectorAll('audio')).forEach(audio => {
//   mixer.addSound(audio)
// })
// mixer.addSound('http://127.0.0.1:5500/audio/orchestra.mp3')
// mixer.play()