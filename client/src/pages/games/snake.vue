<template>
  <div class="flex q-p-sm">
    <canvas id="snakeCanvas" ref="snakeRef" width="608" height="608"></canvas>
  </div>
</template>
<script lang="ts" setup>
import { dom } from 'quasar'
import { ref } from 'vue'
import { note } from '~/utils/useNote'
const { ready } = dom
const snakeRef = ref()

ready(async () => {
  const ctx = await snakeRef && snakeRef.value.getContext('2d')
  // create the unit
  const box = 32

  // load images
  const bgSrc = await import('src/assets/images/ground.png')
  const foodSrc = await import('src/assets/images/food.png')
  // Initialize Images
  const ground = new Image()
  const foodImg = new Image()
  // assign images
  ground.src = bgSrc.default
  foodImg.src = foodSrc.default
  // load audio files
  const deadSrc = await import('@/assets/audio/dead.mp3')
  const eatSrc = await import('@/assets/audio/eat.mp3')
  const upSrc = await import('@/assets/audio/up.mp3')
  const rightSrc = await import('@/assets/audio/right.mp3')
  const leftSrc = await import('@/assets/audio/left.mp3')
  const downSrc = await import('@/assets/audio/down.mp3')
  // Initialize audio files
  const dead = new Audio()
  const eat = new Audio()
  const up = new Audio()
  const right = new Audio()
  const left = new Audio()
  const down = new Audio()
  // assign audio files
  dead.src = deadSrc.default
  eat.src = eatSrc.default
  up.src = upSrc.default
  right.src = rightSrc.default
  left.src = leftSrc.default
  down.src = downSrc.default

  // create the snake
  type snakeType = {
    x: number
    y: number
    size?: number
  }
  const snake: snakeType[] = []
  snake[0] = {
    x: 9 * box,
    y: 10 * box,
  }

  // create the food
  let food = {
    x: Math.floor(Math.random() * 17 + 1) * box,
    y: Math.floor(Math.random() * 15 + 3) * box,
  }
  // create the score var
  let score = 0
  // control the snake
  let d = 'right'
  document.addEventListener('keydown', direction)

  function direction(event: KeyboardEvent) {
    const key = event.keyCode
    if (key === 37 && d !== 'RIGHT') {
      left.play()
      d = 'LEFT'
    }
    else if (key === 38 && d !== 'DOWN') {
      d = 'UP'
      up.play()
    }
    else if (key === 39 && d !== 'LEFT') {
      d = 'RIGHT'
      right.play()
    }
    else if (key === 40 && d !== 'UP') {
      d = 'DOWN'
      down.play()
    }
  }
  type HeadType = {
    x: number
    y: number
  }
  // check collision function
  function collision(head: HeadType, array: snakeType[]) {
    for (let i = 0; i < array.length; i++) {
      if (head.x === array[i].x && head.y === array[i].y)
        return true
    }
    return false
  }

  // draw everything to the canvas
  function draw() {
    ctx.drawImage(ground, 0, 0)
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = (i === 0) ? 'green' : 'white'
      ctx.fillRect(snake[i].x, snake[i].y, box, box)
      ctx.strokeStyle = 'red'
      ctx.strokeRect(snake[i].x, snake[i].y, box, box)
    }
    ctx.drawImage(foodImg, food.x, food.y)
    // old head position
    let snakeX = snake[0].x
    let snakeY = snake[0].y

    // which direction
    if (d === 'LEFT') snakeX -= box
    if (d === 'UP') snakeY -= box
    if (d === 'RIGHT') snakeX += box
    if (d === 'DOWN') snakeY += box

    // if the snake eats the food
    if (snakeX === food.x && snakeY === food.y) {
      score++
      eat.play()
      food = {
        x: Math.floor(Math.random() * 17 + 1) * box,
        y: Math.floor(Math.random() * 15 + 3) * box,
      }
      // we don't remove the tail
    }
    else {
      // remove the tail
      snake.pop()
    }

    // add new Head
    const newHead = {
      x: snakeX,
      y: snakeY,
    }

    // game over
    if (snakeX < box || snakeX > 17 * box || snakeY < 3 * box || snakeY > 17 * box || collision(newHead, snake)) {
      // eslint-disable-next-line no-use-before-define
      clearInterval(game)
      dead.play()
      note.info(`Game Over! Your score is ${score}`)
    }

    snake.unshift(newHead)

    ctx.fillStyle = 'white'
    ctx.font = '45px Changa one'
    ctx.fillText(score, 2 * box, 1.6 * box)
  }

  // call draw function every 100 ms

  let game = setInterval(draw, 100)
})

</script>

<style>
canvas {
  display: block;
  margin: 0 auto;
}
</style>
