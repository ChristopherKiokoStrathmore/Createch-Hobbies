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

