export const issuerLogos = {
  Infosys: "/assets/logos/infosys.svg",
  "Infosys Springboard": "/assets/logos/infosys.svg",
  NeoColab: "/assets/logos/neocolab.svg",
  Udemy: "/assets/logos/udemy.svg",
  "Python Course": "/assets/logos/python.svg"
};

export const techCategories = [
  { title: "Languages", items: ["C", "C++", "Java", "Python", "HTML/CSS", "JavaScript"] },
  { title: "Libraries", items: ["NumPy", "Pandas", "Matplotlib", "Seaborn", "Scikit-learn"] },
  { title: "Tools & Platforms", items: ["Linux", "Shell Scripting", "MySQL", "Power BI", "MS Excel", "Power Query", "Git / GitHub"] },
  { title: "Soft Skills", items: ["Critical Thinking", "Adaptability", "Learning Agility", "Interpersonal Skills"] }
];

// Tech skills with their devicon logo URLs for the 3D sphere
export const techSkillsWithLogos = [
  { name: "Python",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
  { name: "Java",        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
  { name: "JavaScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
  { name: "HTML5",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
  { name: "CSS3",        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
  { name: "C",           logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg" },
  { name: "C++",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" },
  { name: "NumPy",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg" },
  { name: "Pandas",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg" },
  { name: "Matplotlib",  logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/matplotlib/matplotlib-original.svg" },
  { name: "Scikit",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg" },
  { name: "MySQL",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" },
  { name: "Linux",       logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg" },
  { name: "Git",         logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
  { name: "GitHub",      logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" },
  { name: "Power BI",    logo: "https://img.icons8.com/color/96/power-bi.png" },
  { name: "Excel",       logo: "https://img.icons8.com/color/96/microsoft-excel-2019.png" },
  { name: "VS Code",     logo: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" },
];

export const projects = [
  {
    title: "Retail & Warehouse Sales Dashboard",
    subtitle: "Interactive Power BI analytics dashboard",
    image: "/images/project-images/project-dashboard.svg",
    tech: ["Power BI", "Power Query", "DAX", "Data Modeling"],
    description: "Interactive Power BI dashboard analyzing warehouse and retail sales performance across regions with KPI tracking and dynamic filtering.",
    github: "https://github.com/pathakkrishna",
    features: [
      "KPI tracking for sales performance",
      "Dynamic regional and product filtering",
      "Power Query and DAX based business reporting"
    ],
    gallery: [
      "/images/project-images/project-dashboard-screen-1.svg",
      "/images/project-images/project-dashboard-screen-2.svg"
    ]
  },
  {
    title: "Library Book Tracker",
    subtitle: "Console-based library management system",
    image: "/images/project-images/project-learning.svg",
    tech: ["Java", "ArrayList", "OOP"],
    description: "Console-based library management system enabling efficient book record operations including add, delete, search, and display.",
    github: "https://github.com/pathakkrishna",
    features: [
      "Book add, delete, search, and display operations",
      "ArrayList-based record storage",
      "Clean OOP structure for console workflows"
    ],
    gallery: [
      "/images/project-images/project-learning-screen-1.svg",
      "/images/project-images/project-learning-screen-2.svg"
    ]
  },
  {
    title: "COVID-19 Data Analysis Dashboard",
    subtitle: "Python analysis and Excel KPI dashboard",
    image: "/images/project-images/project-metrics.svg",
    tech: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Excel"],
    description: "Analyzed 100K+ COVID-19 records using Python and built an Excel dashboard with KPIs and pivot tables to visualize trends.",
    github: "https://github.com/pathakkrishna",
    features: [
      "100K+ record analysis workflow",
      "Trend visualization with Python libraries",
      "Excel KPI and pivot-table reporting"
    ],
    gallery: [
      "/images/project-images/project-metrics-screen-1.svg",
      "/images/project-images/project-metrics-screen-2.svg"
    ]
  }
];

export const certifications = [
  {
    title: "ChatGPT-4 Prompt Engineering",
    issuer: "Infosys",
    date: "Aug 2025",
    image: "/images/certificates/chatgpt-4 prompt cert.png",
    viewLink: "/images/certificates/chatgpt-4 prompt cert.png",
    verifyLink: "https://verify.onwingspan.com",
    description: "Professional certification focused on prompt engineering patterns, practical AI usage, and structured prompting for large language models.",
    tags: ["AI", "LLM", "Prompt Engineering"]
  },
  {
    title: "Master Generative AI & Generative AI Tools",
    issuer: "Infosys Springboard",
    date: "Aug 21, 2025",
    image: "/images/certificates/Master Generative.png",
    viewLink: "/images/certificates/Master Generative.png",
    verifyLink: "https://verify.onwingspan.com",
    description: "Completed coursework on generative AI tools, modern AI workflows, and practical use cases for productivity and experimentation.",
    tags: ["Generative AI", "AI Tools", "Workflows"]
  },
  {
    title: "Java Programming",
    issuer: "NeoColab",
    date: "May 2025",
    image: "/images/certificates/Java.png",
    viewLink: "/images/certificates/Java.png",
    verifyLink: "https://lpucolab438.examly.io/certificate/U2FsdGVkX1%2BV2o0NbVZPB6HOaG%2BJLTF%2FLaID%2FadxzOw%3D",
    description: "Foundational certification covering Java syntax, programming logic, and problem-solving with object-oriented programming basics.",
    tags: ["Java", "Programming"]
  },
  {
    title: "Object Oriented Programming",
    issuer: "NeoColab",
    date: "Dec 2025",
    image: "/images/certificates/OOPS.png",
    viewLink: "/images/certificates/OOPS.png",
    verifyLink: "https://lpucolab438.examly.io/certificate/U2FsdGVkX19X0BZCUiBv4HT80tcSoHHRYABoUE%2FhSnc%3D",
    description: "Focused on OOP principles including encapsulation, inheritance, abstraction, and class-based design in practical programming tasks.",
    tags: ["OOP", "Design"]
  },
  {
    title: "The English Master Course",
    issuer: "Udemy",
    date: "May 2024",
    image: "/images/certificates/english master.jpg",
    viewLink: "/images/certificates/english master.jpg",
    verifyLink: "https://ude.my/UC-86ed1904-6a73-4373-b45b-1678f943b5fc",
    description: "Coursework aimed at improving communication clarity, English fluency, and confidence in professional and learning environments.",
    tags: ["Communication", "English"]
  },
  {
    title: "Python Basics Certification",
    issuer: "Python Course",
    date: "2025",
    image: "/images/certificates/python basics.png",
    viewLink: "/images/certificates/python basics.png",
    verifyLink: "https://www.hackerrank.com/certificates/iframe/b6202821629f",
    description: "Certification covering Python basics, data types, control flow, and beginner-friendly programming problem solving.",
    tags: ["Python", "Basics"]
  }
];
