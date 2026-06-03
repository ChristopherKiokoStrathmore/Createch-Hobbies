export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type Category =
  | "Vehicles"
  | "Machines"
  | "Science"
  | "Space"
  | "Robots"
  | "Architecture";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  ageRange: string;
  difficulty: Difficulty;
  price: number;
  description: string;
  whatYouLearn: string[];
  images: string[];
  inStock: boolean;
  featured: boolean;
}

export const products: Product[] = [
  {
    id: "race-car",
    name: "Race Car Kit",
    slug: "race-car",
    category: "Vehicles",
    ageRange: "8–12",
    difficulty: "Beginner",
    price: 1200,
    description:
      "Build your own blazing race car from scratch! This snap-fit kit teaches kids how wheels, axles, and aerodynamics work together to create speed. No glue required.",
    whatYouLearn: ["Mechanics", "Aerodynamics", "Engineering"],
    images: [
      "/images/products/race-car-1.jpg",
      "/images/products/race-car-2.jpeg",
      "/images/products/race-car-3.jpeg",
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "walking-robot",
    name: "Walking Robot Kit",
    slug: "walking-robot",
    category: "Robots",
    ageRange: "8–12",
    difficulty: "Intermediate",
    price: 1800,
    description:
      "Assemble a robot that actually walks! Kids discover how gears and cams convert rotary motion into walking movement, the same principle used in real robotics.",
    whatYouLearn: ["Robotics", "Gear Systems", "Motion", "Problem Solving"],
    images: [
      "/images/products/walking-robot-1.png",
      "/images/products/walking-robot-2.png",
      "/images/products/walking-robot-3.png",
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "hydraulic-digger",
    name: "Hydraulic Digger Kit",
    slug: "hydraulic-digger",
    category: "Machines",
    ageRange: "10–14",
    difficulty: "Advanced",
    price: 2200,
    description:
      "Build a fully functional hydraulic excavator powered by water pressure. No electricity needed! Experience the real engineering behind construction machinery.",
    whatYouLearn: ["Hydraulics", "Fluid Mechanics", "Engineering"],
    images: [
      "/images/products/hydraulic-digger-1.png",
      "/images/products/hydraulic-digger-2.png",
      "/images/products/hydraulic-digger-3.png",
      "/images/products/hydraulic-digger-4.png",
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "marble-run",
    name: "Marble Run Kit",
    slug: "marble-run",
    category: "Machines",
    ageRange: "6–10",
    difficulty: "Beginner",
    price: 1500,
    description:
      "Design and build your own marble run! Experiment with gravity, speed, and momentum as marbles race through tunnels, loops, and ramps you create.",
    whatYouLearn: ["Physics", "Gravity", "Creativity", "Spatial Reasoning"],
    images: [
      "/images/products/marble-run-1.jpeg",
      "/images/products/marble-run-2.jpg",
      "/images/products/marble-run-3.jpg",
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "lunar-rover",
    name: "Lunar Rover Kit",
    slug: "lunar-rover",
    category: "Space",
    ageRange: "8–12",
    difficulty: "Intermediate",
    price: 1600,
    description:
      "Build a replica of the moon rover used by astronauts! Learn how vehicles are engineered to handle rough terrain in low-gravity environments.",
    whatYouLearn: ["Space Science", "Engineering", "Problem Solving"],
    images: [
      "/images/products/lunar-rover-1.jpeg",
      "/images/products/lunar-rover-2.jpeg",
      "/images/products/lunar-rover-3.jpeg",
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "ferris-wheel",
    name: "Ferris Wheel Kit",
    slug: "ferris-wheel",
    category: "Architecture",
    ageRange: "8–12",
    difficulty: "Intermediate",
    price: 1400,
    description:
      "Build a spinning Ferris wheel just like the ones at the fair! Learn about rotational mechanics, balance, and structural engineering.",
    whatYouLearn: ["Mechanics", "Balance", "Structural Engineering"],
    images: [
      "/images/products/ferris-wheel-1.jpeg",
      "/images/products/ferris-wheel-2.jpeg",
    ],
    inStock: true,
    featured: true,
  },
  {
    id: "glider-plane",
    name: "Glider Plane Kit",
    slug: "glider-plane",
    category: "Vehicles",
    ageRange: "7–11",
    difficulty: "Beginner",
    price: 900,
    description:
      "Assemble a real glider that actually flies! Discover the principles of lift, drag, and thrust that make aircraft take to the sky.",
    whatYouLearn: ["Aeronautics", "Physics", "Aerodynamics"],
    images: [
      "/images/products/glider-plane-1.png",
      "/images/products/glider-plane-2.png",
      "/images/products/glider-plane-3.png",
      "/images/products/glider-plane-4.png",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "helicopter",
    name: "Helicopter Kit",
    slug: "helicopter",
    category: "Vehicles",
    ageRange: "8–12",
    difficulty: "Intermediate",
    price: 1700,
    description:
      "Build a working helicopter model and learn how rotor blades generate lift. Explore the physics that allow helicopters to hover and fly in any direction.",
    whatYouLearn: ["Aeronautics", "Rotor Mechanics", "Physics"],
    images: [
      "/images/products/helicopter-1.jpeg",
      "/images/products/helicopter-2.jpeg",
      "/images/products/helicopter-3.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "cable-car",
    name: "Cable Car Kit",
    slug: "cable-car",
    category: "Machines",
    ageRange: "8–12",
    difficulty: "Intermediate",
    price: 1300,
    description:
      "Build a cable car system that actually runs along a wire! Learn how tension, pulleys, and counterweights work in real-world transportation systems.",
    whatYouLearn: ["Pulleys", "Tension", "Engineering"],
    images: [
      "/images/products/cable-car-1.jpeg",
      "/images/products/cable-car-2.jpeg",
      "/images/products/cable-car-3.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "elevator",
    name: "Elevator Kit",
    slug: "elevator",
    category: "Machines",
    ageRange: "8–12",
    difficulty: "Intermediate",
    price: 1350,
    description:
      "Build a working elevator model powered by a hand crank! Discover how pulleys and counterweights make buildings taller and more accessible.",
    whatYouLearn: ["Pulleys", "Counterweights", "Engineering"],
    images: [
      "/images/products/elevator-1.jpeg",
      "/images/products/elevator-2.jpeg",
      "/images/products/elevator-3.jpeg",
      "/images/products/elevator-4.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "house",
    name: "House Building Kit",
    slug: "house",
    category: "Architecture",
    ageRange: "6–10",
    difficulty: "Beginner",
    price: 1100,
    description:
      "Build your dream house! Learn about construction, architecture, and design as you assemble walls, roofs, doors, and windows.",
    whatYouLearn: ["Architecture", "Structural Design", "Creativity"],
    images: [
      "/images/products/house-1.jpg",
      "/images/products/house-2.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "optical-illusion-fan",
    name: "Optical Illusion Fan Kit",
    slug: "optical-illusion-fan",
    category: "Science",
    ageRange: "7–12",
    difficulty: "Beginner",
    price: 950,
    description:
      "Build a spinning fan that creates mind-bending optical illusions! Learn about light, color mixing, and how our brains perceive motion.",
    whatYouLearn: ["Optics", "Color Science", "Brain Science"],
    images: [
      "/images/products/optical-illusion-fan-1.jpg",
      "/images/products/optical-illusion-fan-2.jpeg",
      "/images/products/optical-illusion-fan-3.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "solar-fan",
    name: "Solar Fan Kit",
    slug: "solar-fan",
    category: "Science",
    ageRange: "8–13",
    difficulty: "Intermediate",
    price: 1250,
    description:
      "Build a fan powered entirely by sunlight! Learn how solar panels convert light into electricity in this hands-on introduction to renewable energy.",
    whatYouLearn: ["Solar Energy", "Electronics", "Sustainability"],
    images: [
      "/images/products/solar-fan-1.jpeg",
      "/images/products/solar-fan-2.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "table-fan",
    name: "Table Fan Kit",
    slug: "table-fan",
    category: "Science",
    ageRange: "8–12",
    difficulty: "Beginner",
    price: 1000,
    description:
      "Build a working table fan from scratch! Understand how motors convert electrical energy into rotational motion to create airflow.",
    whatYouLearn: ["Electricity", "Motors", "Engineering"],
    images: [
      "/images/products/table-fan-1.jpeg",
      "/images/products/table-fan-2.jpeg",
      "/images/products/table-fan-3.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "tank",
    name: "Tank Kit",
    slug: "tank",
    category: "Vehicles",
    ageRange: "9–14",
    difficulty: "Advanced",
    price: 2000,
    description:
      "Build a detailed tank model with working tracks! Learn about tracked vehicle mechanics, gear ratios, and how armored vehicles navigate rough terrain.",
    whatYouLearn: ["Mechanics", "Gear Ratios", "Engineering"],
    images: [
      "/images/products/tank-1.jpeg",
      "/images/products/tank-2.jpeg",
      "/images/products/tank-3.jpeg",
      "/images/products/tank-4.png",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "train",
    name: "Train Kit",
    slug: "train",
    category: "Vehicles",
    ageRange: "6–10",
    difficulty: "Beginner",
    price: 1150,
    description:
      "Build a classic train that runs on its own track! Learn about wheels, rails, and how railways revolutionized transportation.",
    whatYouLearn: ["Mechanics", "Engineering", "History of Transport"],
    images: [
      "/images/products/train-1.jpeg",
      "/images/products/train-2.jpeg",
    ],
    inStock: true,
    featured: false,
  },
  {
    id: "windmill",
    name: "Windmill Kit",
    slug: "windmill",
    category: "Science",
    ageRange: "7–11",
    difficulty: "Beginner",
    price: 850,
    description:
      "Build a windmill that harvests wind energy! Discover how humans have used wind power for centuries and how modern wind turbines generate electricity.",
    whatYouLearn: ["Renewable Energy", "Wind Mechanics", "Sustainability"],
    images: [
      "/images/products/windmill-1.jpeg",
    ],
    inStock: true,
    featured: false,
  },
];

export const featuredProducts = products.filter((p) => p.featured);
export const categories: Category[] = [
  "Vehicles",
  "Machines",
  "Science",
  "Space",
  "Robots",
  "Architecture",
];
