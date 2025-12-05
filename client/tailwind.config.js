/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#121111',  // black  [name, headings, main text]
        secondary: { // Gray (inactive icons, desc)
          100: '#555555', // icons and desc 
          200: '#D9D9D9'
        },  
        light: '',
        dark:{
          100: '#C62828',  // darker red error text
          200: '',
        },
        accent: '#C03333'   // red [sign in, sigin up, add to cart]
      }
    },
  },
  plugins: [],
}
