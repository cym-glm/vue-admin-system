import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

const prod = process.env.NODE_ENV === 'production'

export default {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    ...(prod ? [cssnano({ preset: 'default' })] : [])
  ]
}
