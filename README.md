# Welcome to [Astro](https://astro.build) + [Mitosis](https://github.com/BuilderIO/mitosis)

## IMPORTANT:

There is a caveat. Astro is using `vue@3.2.33`, but `@builder.io/mitosis` is using `vue-template-compiler@2.6.14`. In order to get the mitosis components to compile, you need to change the following file inside `/node_modules`:

- `/node_modules/vue-template-compiler/index.js`:

  ```diff
   try {
     var vueVersion = require('vue').version
   } catch (e) {}

   var packageName = require('./package.json').name
   var packageVersion = require('./package.json').version
  -if (vueVersion && vueVersion !== packageVersion) {
  +if (false && vueVersion && vueVersion !== packageVersion) {
     var vuePath = require.resolve('vue')
     var packagePath = require.resolve('./package.json')
     throw new Error(
       '\n\nVue packages version mismatch:\n\n' +
       '- vue@' + vueVersion + ' (' + vuePath + ')\n' +
       '- ' + packageName + '@' + packageVersion + ' (' + packagePath + ')\n\n' +
       'This may cause things to work incorrectly. Make sure to use the same version for both.\n' +
       'If you are using vue-loader@>=10.0, simply update vue-template-compiler.\n' +
       'If you are using vue-loader@<10.0 or vueify, re-installing vue-loader/vueify should bump ' + packageName + ' to the latest.\n'
     )
   }

   module.exports = require('./build')
  ```

## Installation

Run these commands:

```
$> npm install

$> npm run mitosis

$> npm start
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/arijs/astro-mitosis/tree/latest)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   ├── robots.txt
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Tour.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
|:----------------  |:-------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:3000`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## 👀 Want to learn more?

Feel free to check [our documentation](https://github.com/withastro/astro) or jump into our [Discord server](https://astro.build/chat).
