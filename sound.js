class Mixer {
  constructor() {
    this.AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioCtx = new this.AudioContext()
    this.sources = []
  }

  async addSound(src) {
    if (src instanceof HTMLAudioElement) {
      return this.addSoundFromElement(src)
    }
    if (typeof src === 'string') {
      return await this.addSoundFromURL(src)
    }
    console.error(new Error(`${src} is not an HTMLAudioElement`))
    return
  }
  
  addSoundFromElement(audioEl) {
    const source = this.audioCtx.createMediaElementSource(audioEl)
    source.mediaElement.loop = true
    const gainNode = this.audioCtx.createGain()
    source.connect(gainNode)
    gainNode.gain.value = audioEl.getAttribute('volume') || 1
    gainNode.connect(this.audioCtx.destination)
    this.sources.push(source)
    return this.audioCtx
  }

  async addSoundFromURL(url) {
    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'

    const audio = await new Promise((resolve, reject) => {
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

    const source = this.audioCtx.createBufferSource()
    source.buffer = audio
    source.loop = true
    source.connect(this.audioCtx.destination)
    this.sources.push(source)
    return source
  }

  playByType(src) {
    if (src instanceof AudioBufferSourceNode) {
      try {
        src.start(0)
      } catch (err) {
        console.warn(`${src} is already playing, ${err}`)
      }
    } else if (src instanceof MediaElementAudioSourceNode){
      src.mediaElement.play()
    } else {
      console.error(`${src} is not a supported type`)
    }
  }

  play(index = null) {
    if (typeof index === 'number' && this.sources[index]) {
      const src = this.sources[index]
      this.playByType(src)
    }
    this.sources.forEach(s => {
      this.playByType(s)
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
// Array.from(document.querySelectorAll('audio')).forEach(audio => {
//   mixer.addSound(audio)
// })
// mixer.addSound('http://127.0.0.1:5500/audio/orchestra.mp3')
// mixer.play()