import Replicate from 'replicate';
import dotenv from 'dotenv';
dotenv.config()

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: 'https://www.npmjs.com/package/create-replicate'
})

const model = 'cjwbw/videocrafter:02edcff3e9d2d11dcc27e530773d988df25462b1ee93ed0257b6f246de4797c8'
const input = {
  prompt: 'With the style of van Gogh, A young couple dances under the moonlight by the lake.',
  save_fps: 10,
  ddim_steps: 50,
  unconditional_guidance_scale: 12,
}

console.log({ model, input })
console.log('Running...')
const output = await replicate.run(model, { input })
console.log('Done!', output)
