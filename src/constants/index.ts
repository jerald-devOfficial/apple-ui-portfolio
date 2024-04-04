import {
  CodeBracketIcon,
  SquaresPlusIcon,
  BriefcaseIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'

export const sideIcons = [
  {
    title: 'Skills',
    icon: CodeBracketIcon
  },
  {
    title: 'Projects',
    icon: SquaresPlusIcon
  },
  {
    title: 'Work Experiences',
    icon: BriefcaseIcon
  },
  {
    title: 'Certifications',
    icon: BookOpenIcon
  }
]

export const skills = [
  {
    img: '/images/brands/next.js.png',
    title: `The React Framework for the Web`,
    desc: `Used by some of the world's largest companies, Next.js enables you to create high-quality web applications with the power of React components.`,
    url: 'nextjs.org'
  },
  {
    img: '/images/brands/react.png',
    title: `React`,
    desc: `The library for web and native user interfaces`,
    url: 'react.dev'
  },
  {
    img: '/images/brands/javascript.png',
    title: `JavaScript`,
    desc: `JavaScript (JS) is a lightweight interpreted (or just-in-time compiled) programming language with first-class functions. JavaScript is a prototype-based, multi-paradigm, single-threaded, dynamic language, supporting object-oriented, imperative, and declarative (e.g. functional programming) styles.`
  },
  {
    img: '/images/brands/typescript.png',
    title: `TypeScript is JavaScript with syntax for types.`,
    desc: `TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.`,
    url: 'typescriptlang.org'
  },
  {
    img: '/images/brands/tailwindcss.png',
    title: `Tailwind CSS`,
    desc: `Rapidly build modern websites without ever leaving your HTML.`,
    url: 'tailwindcss.com'
  },
  {
    img: '/images/brands/mongodb.png',
    title: `MongoDB`,
    desc: `MongoDB is a source-available, cross-platform, document-oriented database program. Classified as a NoSQL database product, MongoDB utilizes JSON-like documents with optional schemas.`,
    url: 'mongodb.com'
  },
  {
    img: '/images/brands/web3js.png',
    title: `Web3.js`,
    desc: `A JavaScript library for building on Ethereum`,
    url: 'web3js.org'
  },
  {
    img: '/images/brands/aws.png',
    title: `Cloud Computing Services - Amazon Web Services (AWS)`,
    desc: `Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud, offering over 200 fully featured services from data centers globally. Millions of customers—including the fastest-growing startups, largest enterprises, and leading government agencies—are using AWS to lower costs, become more agile, and innovate faster.`,
    url: 'aws.amazon.com'
  },
  {
    img: '/images/brands/figma.png',
    title: `Figma: The Collaborative Interface Design Tool`,
    desc: `Figma is the leading collaborative design tool for building meaningful products. Seamlessly design, prototype, develop, and collect feedback in a single platform.`,
    url: 'figma.com'
  }
]

export const projects = [
  {
    title: 'Messenger Application',
    desc: 'A feature-rich Messenger Clone App using Next.js, Tailwind CSS, Context API, App Router and MongoDB, TypeScript, Prisma, and Pusher for live chat. You can chat or group chat with friends.',
    img: '/images/projects/messenger.png',
    url: 'messenger-jerald-devofficial.vercel.app/',
    github: 'https://github.com/jerald-devOfficial/messenger'
  },
  {
    title: 'Inventory System Website',
    desc: 'An inventory web application built with React.js, Firebase, and Tailwind CSS.',
    img: '/images/projects/inventory.png',
    url: 'inventory-751b9.web.app/',
    github:
      'https://github.com/jerald-devOfficial/Inventory-App-with-React-Firebase'
  },
  {
    title: 'Forkify Recipe App',
    desc: 'A recipe repository and recipe creation app built with plain vanilla JS and SCSS',
    img: '/images/projects/forkify-recipe-app.png',
    url: 'https://forkify-jerald.netlify.app/',
    github: 'https://github.com/jerald-devOfficial/forkify'
  },
  {
    img: '/images/projects/dice-game.png',
    title: 'Dice Game',
    desc: `This is a Dice Roll/Pig game. Made with pure Javascript DOM. You can roll the dice, hold and the other player will play it's turn.`,
    url: 'https://jerald-devofficial.github.io/,Dice-Pig-Game/',
    github: 'https://github.com/jerald-devOfficial/Dice-Pig-Game'
  },
  {
    img: '/images/projects/hackr-clone.png',
    title: 'Hackr.io',
    desc: 'A clone of a popular software repository and learning website called hackr.io',
    url: 'https://hackr-nextjs.vercel.app/',
    github: 'https://github.com/jerald-devOfficial/hackr-nextjs'
  }
]

export const workExperiences = [
  {
    startDate: 'Jan 2021',
    endDate: 'Jul 2022',
    isPresent: false,
    company: 'Panteum Foundation',
    logo: '/images/jobs/panteum.jpg',
    projects: [
      {
        title: 'JavaScript Developer',
        name: 'Penumbra CSS',
        desc: [
          'Creating and building a CSS Framework dynamically using Javascript, SASS/SCSS, PugJS, and NodeJS.'
        ]
      },
      {
        title: 'Web and Application Developer',
        name: 'Hoody VPN',
        desc: [
          'Developed Hoody VPN application using MithrilJS, MobX and SCSS that runs on Tauri. Also developed the website blog of the application using NodeJS and TailwindCSS.'
        ]
      }
    ]
  },
  {
    startDate: 'Apr 2021',
    endDate: 'Nov 2021',
    isPresent: false,
    company: 'Candid-I',
    logo: '/images/jobs/candid-i.png',
    projects: [
      {
        title: 'Full Stack Developer',
        name: 'Candid-I Recruitment Platform',
        desc: [
          'Main developer, building a MVP recruiting web application through server-less stack with React JS and Firebase.'
        ]
      }
    ]
  },
  {
    startDate: 'Sep 2021',
    endDate: 'Aug 2022',
    isPresent: false,
    company: 'Accenture',
    logo: '/images/jobs/accenture.png',
    projects: [
      {
        title: 'Software Engineer Analyst',
        name: 'Geared Investments web app - Commonwealth Bank of Australia',
        desc: [
          'Frontend UI and API developer for a banking website using React JS, Typescript, Material UI, and .NET for one of the leading banks in Australia.'
        ]
      }
    ]
  },
  {
    startDate: 'Sep 2022',
    isPresent: false,
    endDate: 'Jul 2023',
    company: 'WOOP Scholarship',
    logo: '/images/jobs/woop.png',
    projects: [
      {
        title: 'Chief Technology Officer',
        name: 'Hooves Tech',
        desc: [
          'Web agency for clients wanting to build websites with Hooves Tech; built with Next.js, Redux Toolkit, TypeScript, and Tailwind CSS.'
        ]
      },
      {
        title: 'CTO, Software Engineer Architect',
        name: 'WOOP Scholarship',
        desc: [
          'Developed and implemented software solutions utilizing Next.js 13.4, TypeScript, TailwindCSS, Node.js, Express, MongoDB, Vercel, and AWS.',
          'Collaborated with other departments such as Quality Assurance, Product Management, Designers. to ensure successful project delivery.',
          'Provided mentorship and guidance to junior software engineers on technical issues and best practices.'
        ]
      }
    ]
  },
  {
    startDate: 'Feb 2024',
    isPresent: true,
    company: 'Edfolio',
    logo: '/images/jobs/edfolio.jpg',
    projects: [
      {
        title: 'Front End Developer',
        name: 'Skooltek',
        desc: [
          'Front end developer of version 2 of Skooltek web application using Vue.js, Nuxt.js, and Tailwind CSS.'
        ]
      }
    ]
  }
]

export const education = {
  school: {
    name: 'Siquijor State College - Lazi Campus',
    course: 'Associate of Science in Information Technology',
    date: '2017 - 2019',
    logo: '/images/education/ssc.jpg'
  },
  certificates: [
    {
      title: 'The Complete 2020 Web Development Bootcamp',
      issued: 'Oct 2020',
      credentialID: 'UC-b03ce780-eaf9-496f-a9fa-a20b1dfdb5b8'
    },
    {
      title: 'Advanced CSS and Sass: Flexbox, Grid, Animations and More!',
      issued: 'Nov 2020',
      credentialID: 'UC-f09b9cd0-4b5d-4be6-b136-71dcd1adcf29'
    },
    {
      title: 'Node with React: Fullstack Web Development',
      issued: 'Dec 2020',
      credentialID: 'UC-cee68f79-f493-422b-b3f1-f18805b6d9c9'
    },
    {
      title: 'React Next.js Node API AWS - Build Scaling MERN Stack App',
      issued: 'Aug 2022',
      credentialID: 'UC-368a445c-319e-4bbb-881c-6ab4134d1cb2'
    },
    {
      title: 'The Complete JavaScript Course 2022: From Zero to Expert!',
      issued: 'Sep 2022',
      credentialID: 'UC-30cf8a1d-fe54-4df7-baa8-6c8acdab5055'
    },

    {
      title: 'Mastering TypeScript - 2022 Edition',
      issued: 'Sep 2022',
      credentialID: 'UC-c58082c1-462c-4e57-a0bb-3757f9aec968'
    }
  ]
}
