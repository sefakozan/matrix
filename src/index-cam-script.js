const asciiChars = '@#S%?*+;:,. '

// video
const video = document.getElementById('video')
const vcanvas = document.getElementById('vcanvas')
const vctx = vcanvas.getContext('2d')

// Web kamerasına erişim
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream
    video.play()
  })
  .catch(err => console.error('Web kamerası erişim hatası:', err))

video.addEventListener('loadedmetadata', () => {
  renderVideo()
})

// matrix
const mcanvas = document.getElementById('mcanvas')
const mctx = mcanvas.getContext('2d')

// Karakter boyutları ve sütun genişliği
const fontSize = 5

let columns
let rows
let matrixCharArr
let yPositions

// Animasyon hızı (ms cinsinden, daha büyük değer daha yavaş animasyon)
let timerId
const animationDelay = 80
let flag = 6
const text = 'KOZAN '
let randomColumn = -1

function pickRandomColumn () {
  if (flag > 5) {
    flag = 0
  }

  if (randomColumn < 0) {
    flag = 0
    randomColumn = Math.floor(Math.random() * columns - 1)
  }
}

// Rastgele karakter
function getRandomCharacter (currentColumn) {
  if (currentColumn !== undefined) {
    pickRandomColumn()
    if (randomColumn === currentColumn) {
      return text[flag++]
    }
  }

  const randomCode = 33 + Math.floor(Math.random() * (126 - 33 + 1))
  return String.fromCharCode(randomCode)
}

// Ekran dışı Y pozisyonlarını yönet
function inScreenYPosition (y, height) {
  if (y < 0) return y + height
  if (y < height) return y
  return 0
}

// Animasyon döngüsü
function updateAllColumns () {
  // Arka planı hafif karart
  mctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  mctx.fillRect(0, 0, mcanvas.width, mcanvas.height)
  mctx.font = `${fontSize}px monospace`

  for (let x = 0; x < columns; x++) {
    let mchar
    const brightness = 255
    const brightnessSoft = 100

    // console.log(brightness);
    // console.log(brightness_soft);

    // Açık yeşil karakter
    mctx.fillStyle = `rgb(0, ${brightness}, 0)`
    mchar = getRandomCharacter(x)
    mctx.fillText(mchar, x * fontSize, yPositions[x] * fontSize)
    matrixCharArr[x][yPositions[x]] = mchar

    // Koyu yeşil karakter (2 adım yukarıda)
    mctx.fillStyle = `rgb(0, ${brightnessSoft}, 0)`
    const temp = inScreenYPosition(yPositions[x] - 2, Math.floor(mcanvas.height / fontSize))
    mchar = getRandomCharacter()
    mctx.fillText(mchar, x * fontSize, temp * fontSize)
    matrixCharArr[x][temp] = mchar

    // Boşluk (20 adım yukarıda)
    mctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`
    const temp1 = inScreenYPosition(yPositions[x] - 20, Math.floor(mcanvas.height / fontSize))
    mchar = ' '
    mctx.fillText(mchar, x * fontSize, temp1 * fontSize)
    if (Math.random() * 1000 < 300) matrixCharArr[x][temp1] = mchar

    // Y pozisyonunu güncelle
    yPositions[x] = inScreenYPosition(yPositions[x] + 1, Math.floor(mcanvas.height / fontSize))
  }

  timerId = setTimeout(updateAllColumns, animationDelay)
}

// Başlangıç fonksiyonu
function initialize () {
  mcanvas.width = window.innerWidth
  mcanvas.height = window.innerHeight

  columns = Math.floor(mcanvas.width / fontSize)
  rows = Math.floor(mcanvas.height / fontSize)
  yPositions = new Array(columns).fill(0)

  matrixCharArr = new Array(columns)
  for (let i = 0; i < columns; i++) {
    matrixCharArr[i] = new Array(rows)
  }

  vcanvas.width = Math.floor(mcanvas.width / fontSize)
  vcanvas.height = Math.floor(mcanvas.height / fontSize)

  mctx.fillStyle = 'black'
  mctx.fillRect(0, 0, mcanvas.width, mcanvas.height)
  for (let x = 0; x < columns; x++) {
    yPositions[x] = Math.floor(Math.random() * (mcanvas.height / fontSize))
  }
}

function renderVideo () {
  vctx.clearRect(0, 0, vcanvas.width, vcanvas.height) // Canvas'ı temizle
  vctx.drawImage(video, 0, 0, vcanvas.width, vcanvas.height)

  // Piksel verilerini al
  const imageData = vctx.getImageData(0, 0, vcanvas.width, vcanvas.height)
  const data = imageData.data

  // const percentH = Math.round(vcanvas.height / 20)
  // const percentW = Math.round(vcanvas.width / 20)

  for (let y = 0; y < vcanvas.height; y++) {
    for (let x = 0; x < vcanvas.width; x++) {
      // Pikselin RGB değerlerini al
      const i = (y * vcanvas.width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Gri tonlamaya çevir (ortalama yoğunluk)
      let brightness = (r + g + b) / 3
      brightness = (r + g + b) / 3

      const charIndex = Math.floor((brightness / 255) * (asciiChars.length - 1))

      // if (brightness > 100) {
      //   brightness = 255
      // } else {
      //   brightness = 100
      // }

      let oldChar = matrixCharArr[x][y]
      // continue

      if (oldChar === undefined || oldChar === ' ') {
        oldChar = asciiChars[charIndex]
      }

      mctx.fillStyle = `rgb(0, ${brightness}, 0,1)`

      mctx.fillText(oldChar, x * fontSize, y * fontSize)
    }
  }

  setTimeout(renderVideo, animationDelay)
  // requestAnimationFrame(renderVideo)
}

// Pencere yeniden boyutlandırıldığında Canvas'ı güncelle
window.addEventListener('resize', () => {
  clearTimeout(timerId)
  initialize()
  updateAllColumns()
})

// Başlat
initialize()
updateAllColumns()
