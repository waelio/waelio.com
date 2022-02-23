export const runSetup = () => {
  const width: number = window.innerWidth;
  const height: number = window.innerHeight;
  const html = document.querySelector('html')
  html.style.setProperty('--vh', `${height / 100}px`)
  html.style.setProperty('--vw', `${width / 100}px`)
  window.addEventListener('resize', () => {
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    html.style.setProperty('--vh', `${height / 100}px`)
    html.style.setProperty('--vw', `${width / 100}px`)
  })
}

export default runSetup