import {
  BookOpenIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  SquaresPlusIcon
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
    name: 'React',
    category: 'Frontend',
    img: '/images/brands/react.png',
    title: 'React',
    desc: 'Component-driven UI for web apps and design systems; core of most production frontends I ship.',
    url: 'react.dev'
  },
  {
    name: 'Next.js',
    category: 'Frontend',
    img: '/images/brands/next.js.png',
    darkInvert: true,
    title: 'Next.js',
    desc: 'App Router, SSR/SSG, and full-stack TypeScript apps — primary framework for product and enterprise UIs.',
    url: 'nextjs.org'
  },
  {
    name: 'TypeScript',
    category: 'Frontend',
    img: '/images/brands/typescript.png',
    title: 'TypeScript',
    desc: 'Typed JavaScript across frontend and backend for safer refactors and clearer APIs.',
    url: 'typescriptlang.org'
  },
  {
    name: 'JavaScript',
    category: 'Frontend',
    img: '/images/brands/javascript.png',
    title: 'JavaScript',
    desc: 'Language foundation for browser, Node, and tooling across the stack.'
  },
  {
    name: 'React Native',
    category: 'Frontend',
    img: '/images/brands/react.png',
    title: 'React Native',
    desc: 'Cross-platform mobile UIs sharing React patterns with web codebases.',
    url: 'reactnative.dev'
  },
  {
    name: 'Redux Toolkit',
    category: 'Frontend',
    iconKey: 'redux',
    iconColor: '#764ABC',
    title: 'Redux Toolkit',
    desc: 'Predictable client state for complex product workflows and shared app data.',
    url: 'redux-toolkit.js.org'
  },
  {
    name: 'Zustand',
    category: 'Frontend',
    title: 'Zustand',
    desc: 'Lightweight React state management for focused client stores.',
    url: 'zustand.docs.pmnd.rs'
  },
  {
    name: 'Material UI',
    category: 'Frontend',
    iconKey: 'mui',
    iconColor: '#007FFF',
    title: 'Material UI',
    desc: 'Enterprise-ready React component library used heavily on regulated and large-scale UIs.',
    url: 'mui.com'
  },
  {
    name: 'Tailwind CSS',
    category: 'Frontend',
    img: '/images/brands/tailwindcss.png',
    title: 'Tailwind CSS',
    desc: 'Utility-first styling for fast, consistent UI delivery.',
    url: 'tailwindcss.com'
  },
  {
    name: 'SCSS',
    category: 'Frontend',
    iconKey: 'sass',
    iconColor: '#CC6699',
    title: 'SCSS',
    desc: 'Structured stylesheets for design systems and legacy CSS architecture.',
    url: 'sass-lang.com'
  },
  {
    name: 'Node.js',
    category: 'Backend',
    iconKey: 'nodedotjs',
    iconColor: '#339933',
    title: 'Node.js',
    desc: 'Server runtime for APIs, tooling, and full-stack TypeScript services.',
    url: 'nodejs.org'
  },
  {
    name: 'NestJS',
    category: 'Backend',
    iconKey: 'nestjs',
    iconColor: '#E0234E',
    title: 'NestJS',
    desc: 'Structured Node framework for modular REST APIs and backend services.',
    url: 'nestjs.com'
  },
  {
    name: 'Express',
    category: 'Backend',
    iconKey: 'express',
    darkInvert: true,
    title: 'Express',
    desc: 'Lightweight HTTP APIs and middleware for Node services.',
    url: 'expressjs.com'
  },
  {
    name: 'Prisma',
    category: 'Backend',
    iconKey: 'prisma',
    darkInvert: true,
    title: 'Prisma',
    desc: 'Type-safe ORM for PostgreSQL-backed product APIs.',
    url: 'prisma.io'
  },
  {
    name: 'PostgreSQL',
    category: 'Backend',
    iconKey: 'postgresql',
    iconColor: '#4169E1',
    title: 'PostgreSQL',
    desc: 'Primary relational database for production product and Web3 backends.',
    url: 'postgresql.org'
  },
  {
    name: 'MongoDB',
    category: 'Backend',
    img: '/images/brands/mongodb.png',
    title: 'MongoDB',
    desc: 'Document database for flexible product data models and rapid iteration.',
    url: 'mongodb.com'
  },
  {
    name: 'Mongoose',
    category: 'Backend',
    iconKey: 'mongodb',
    iconColor: '#880000',
    title: 'Mongoose',
    desc: 'MongoDB ODM for schema modeling and typed data access in Node services.',
    url: 'mongoosejs.com'
  },
  {
    name: 'Firebase',
    category: 'Backend',
    iconKey: 'firebase',
    iconColor: '#FFCA28',
    title: 'Firebase',
    desc: 'Auth, hosting, and serverless backends for MVPs and realtime apps.',
    url: 'firebase.google.com'
  },
  {
    name: 'AWS',
    category: 'Cloud & DevOps',
    img: '/images/brands/aws.png',
    title: 'AWS',
    desc: 'ECS, Fargate, EC2, and S3 for deployable, production cloud workloads.',
    url: 'aws.amazon.com'
  },
  {
    name: 'Docker',
    category: 'Cloud & DevOps',
    iconKey: 'docker',
    iconColor: '#2496ED',
    title: 'Docker',
    desc: 'Containerized services for consistent local and cloud deployments.',
    url: 'docker.com'
  },
  {
    name: 'NX',
    category: 'Cloud & DevOps',
    iconKey: 'nx',
    darkInvert: true,
    title: 'NX',
    desc: 'Monorepo tooling for multi-app frontend platforms and shared libraries.',
    url: 'nx.dev'
  },
  {
    name: 'Playwright',
    category: 'Cloud & DevOps',
    iconKey: 'playwright',
    iconColor: '#2EAD33',
    title: 'Playwright',
    desc: 'End-to-end browser automation for reliable UI regression coverage.',
    url: 'playwright.dev'
  },
  {
    name: 'Jest / Vitest',
    category: 'Cloud & DevOps',
    iconKey: 'vitest',
    iconColor: '#729B1B',
    title: 'Jest & Vitest',
    desc: 'Unit and integration testing for TypeScript apps and shared libraries.',
    url: 'vitest.dev'
  },
  {
    name: 'GitHub Actions',
    category: 'Cloud & DevOps',
    iconKey: 'githubactions',
    iconColor: '#2088FF',
    title: 'GitHub Actions',
    desc: 'CI/CD pipelines for build, test, and deploy automation.',
    url: 'github.com/features/actions'
  },
  {
    name: 'Jenkins',
    category: 'Cloud & DevOps',
    iconKey: 'jenkins',
    iconColor: '#D24939',
    title: 'Jenkins',
    desc: 'Enterprise CI/CD used alongside GitHub for release pipelines.',
    url: 'jenkins.io'
  },
  {
    name: 'Nginx',
    category: 'Cloud & DevOps',
    iconKey: 'nginx',
    iconColor: '#009639',
    title: 'Nginx',
    desc: 'Reverse proxy and edge routing in front of app and cloud services.',
    url: 'nginx.org'
  }
]

export const skillCategories = [
  'Frontend',
  'Backend',
  'Cloud & DevOps'
] as const


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
    startDate: 'Aug 2025',
    endDate: 'Jun 2026',
    isPresent: false,
    company: 'Australian energy retailer (confidential)',
    location: 'Remote / Australia',
    logoPlaceholder: true,
    projects: [
      {
        title: 'Senior Full Stack Engineer',
        name: 'Internet / Broadband customer platforms',
        desc: [
          'Led frontend delivery for high-traffic internet/broadband customer platforms in an NX monorepo and multiple microsite repositories (React, TypeScript, Material UI).',
          'Established reliable E2E coverage with Playwright and BrowserStack, including browser overrides for cross-environment validation.',
          'Shipped native macOS productivity apps used by engineering teams to speed day-to-day workflows.',
          'Raised code quality through PR reviews and cross-team standards; owned CI/CD pipelines on GitHub and Jenkins.'
        ]
      }
    ]
  },
  {
    startDate: 'Apr 2024',
    endDate: 'Aug 2024',
    isPresent: false,
    company: 'Prostrive',
    location: 'Remote (Contract)',
    logo: '/images/jobs/prostrive.png',
    projects: [
      {
        title: 'Senior JavaScript Developer',
        name: 'Deelscootmobiel',
        desc: [
          'Built and shipped Deelscootmobiel web, mobile, and kiosk clients with Next.js, React, TypeScript, NestJS, PostgreSQL, and Prisma.',
          'Deployed and hardened AWS services (ECS, Fargate, EC2, S3) behind Nginx for secure reverse-proxy and production traffic.'
        ]
      }
    ]
  },
  {
    startDate: 'Jul 2024',
    endDate: 'Dec 2024',
    isPresent: false,
    company: 'Coral Sourcing, LLC',
    location: 'Remote (Contract)',
    logoPlaceholder: true,
    projects: [
      {
        title: 'Next.js Developer',
        name: 'Web3 Application',
        desc: [
          'Delivered Web3/NFT gaming product features with Next.js, TypeScript, NestJS, PostgreSQL, and Wagmi — including wallet/NFT transaction flows and responsive performance work.'
        ]
      }
    ]
  },
  {
    startDate: 'May 2024',
    endDate: 'Jul 2024',
    isPresent: false,
    company: 'Narrasoft',
    location: 'Remote (Contract)',
    logo: '/images/jobs/narrasoft.png',
    projects: [
      {
        title: 'Next.js Developer',
        name: 'Metaverse Project',
        desc: [
          'Shipped Metaverse product features with Next.js, TypeScript, PostgreSQL, and NestJS.'
        ]
      }
    ]
  },
  {
    startDate: 'Sep 2022',
    isPresent: false,
    endDate: 'Jul 2023',
    company: 'WOOP Scholarship',
    location: 'Pagadian City',
    logo: '/images/jobs/woop.png',
    projects: [
      {
        title: 'Lead Engineer (CTO)',
        name: 'WOOP Scholarship & Hooves Tech',
        desc: [
          'Architected and shipped a scholarship matchmaking platform end-to-end (Next.js, TypeScript, Redux Toolkit, Node.js, Express, MongoDB, Vercel, AWS); also led Hooves Tech client builds.',
          'Led engineering execution with QA, product, and design; mentored junior developers on standards and delivery practices.'
        ]
      }
    ]
  },
  {
    startDate: 'Sep 2021',
    endDate: 'Aug 2022',
    isPresent: false,
    company: 'Accenture',
    location: 'Cebu City',
    logo: '/images/jobs/accenture.png',
    projects: [
      {
        title: 'Software Engineer Analyst',
        name: 'Geared Investments web app - Commonwealth Bank of Australia',
        desc: [
          'Built frontend UI and API integrations for Commonwealth Bank of Australia Geared Investments (React, TypeScript, Material UI, Redux, .NET) in a regulated fintech environment.'
        ]
      }
    ]
  },
  {
    startDate: 'Apr 2021',
    endDate: 'Nov 2021',
    isPresent: false,
    company: 'Candid-I',
    location: 'Singapore (Concurrent)',
    logo: '/images/jobs/candid-i.png',
    projects: [
      {
        title: 'Full Stack Developer',
        name: 'Candid-I Recruitment Platform',
        desc: [
          'Owned MVP delivery of a recruiting platform on React, Tailwind CSS, and Firebase.'
        ]
      }
    ]
  },
  {
    startDate: 'Jan 2021',
    endDate: 'Jul 2022',
    isPresent: false,
    company: 'Panteum Foundation',
    location: 'Cebu City',
    logo: '/images/jobs/panteum.jpg',
    projects: [
      {
        title: 'JavaScript Developer',
        name: 'Penumbra CSS & Hoody VPN',
        desc: [
          'Built the Penumbra CSS framework (Node.js, Pug, SCSS) and co-developed Hoody VPN desktop clients (Mithril.js, Tauri) plus supporting web properties.'
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
    },
    {
      title: "Ethereum and Solidity: The Complete Developer's Guide",
      issued: 'Dec 2024',
      credentialID: 'UC-ec48e60a-df16-48b2-bf57-a065022eb57a'
    },
    {
      title: 'React Native - The Practical Guide [2025]',
      issued: 'Feb 2025',
      credentialID: 'UC-fe7bafac-a828-4c17-b5ce-5b22ea5f6922'
    }
  ]
}

export const contact = {
  phoneNumber: '09667652125'
}
