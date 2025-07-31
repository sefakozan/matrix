// ASCII karakter seti (yoğunluk sırasına göre)
const asciiChars = '@#S%?*+;:,. '

// Video ve canvas elementlerini al
const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const mcanvas = document.getElementById('mcanvas')
const mctx = mcanvas.getContext('2d')
const asciiDiv = document.getElementById('ascii')

const fontSize = 8

// Web kamerasına erişim
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream
    video.play()
  })
  .catch(err => console.error('Web kamerası erişim hatası:', err))

// Video yüklendiğinde canvas boyutlarını ayarla
video.addEventListener('loadedmetadata', () => {
  mcanvas.width = video.videoWidth / fontSize
  mcanvas.height = video.videoHeight / fontSize
  mcanvas.width = video.videoWidth
  mcanvas.height = video.videoHeight
  mctx.fillStyle = 'black'
  mctx.fillRect(0, 0, mcanvas.width, mcanvas.height)
  render()
})

function getRandomCharacter () {
  const randomCode = 33 + Math.floor(Math.random() * (126 - 33 + 1))
  return String.fromCharCode(randomCode)
}

// Görüntüyü ASCII'ye dönüştür
function render () {
  // Videodan canvas'a çiz, görüntüyü ortala
  const videoAspectRatio = video.videoWidth / video.videoHeight
  const canvasAspectRatio = mcanvas.width / mcanvas.height

  let drawWidth, drawHeight, offsetX, offsetY

  if (videoAspectRatio > canvasAspectRatio) {
    // Video canvas'tan daha geniş, yüksekliği canvas'a uydur
    drawHeight = mcanvas.height
    drawWidth = drawHeight * videoAspectRatio
    offsetX = (mcanvas.width - drawWidth) / 2
    offsetY = 0
  } else {
    // Video canvas'tan daha uzun, genişliği canvas'a uydur
    drawWidth = mcanvas.width
    drawHeight = drawWidth / videoAspectRatio
    offsetX = 0
    offsetY = (mcanvas.height - drawHeight) / 2
  }

  mctx.clearRect(0, 0, mcanvas.width, mcanvas.height) // Canvas'ı temizle
  mctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight)

  // Piksel verilerini al
  const imageData = mctx.getImageData(0, 0, mcanvas.width, mcanvas.height)
  const data = imageData.data

  let ascii = ''
  // Her pikseli tara
  for (let y = 0; y < mcanvas.height; y++) {
    for (let x = 0; x < mcanvas.width; x++) {
      // Pikselin RGB değerlerini al
      const i = (y * mcanvas.width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Gri tonlamaya çevir (ortalama yoğunluk)
      const brightness = (r + g + b) / 3

      mctx.fillStyle = `rgb(0, ${brightness}, 0)`
      mctx.fillText(getRandomCharacter(), x * fontSize, y * fontSize)

      // Yoğunluğa göre ASCII karakter seç
      const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1))
      ascii += asciiChars[charIndex]
    }
    ascii += '\n' // Yeni satır
  }

  // ASCII art'ı ekrana yaz
  asciiDiv.textContent = ascii

  // Sürekli render et
  requestAnimationFrame(render)
}
