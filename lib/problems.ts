export interface Problem {
  id: number;
  title: string;
  companies: string[];
  designPattern?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  slug: string;
  description: string;
  examples: {
    input: string;
    output: string;
  }[];
}

export const problems: Record<string, Problem> = {
  "design-parking-lot": {
    id: 7,
    title: "Design a Parking Lot",
    companies: ["Amazon", "Microsoft", "Goldman Sachs"],
    designPattern: "Strategy",
    difficulty: "Medium",
    slug: "design-parking-lot",
    description: "Design a parking lot system that can manage multiple types of vehicles and parking spots. The system should support different vehicle types (car, motorcycle, truck) and different spot types. Implement functionality to park vehicles, find available spots, and calculate fees.",
    examples: [
      {
        input: "Park a car in a compact spot",
        output: "Car parked successfully in spot C1"
      }
    ],
  },
  "design-hit-counter": {
    id: 6,
    title: "Design a Hit Counter/Webpage Visits Counter - Multi-Threaded",
    companies: ["Amazon", "Adobe", "Atlassian"],
    difficulty: "Medium",
    slug: "design-hit-counter",
    description: "Design a hit counter that can count the number of hits received in the past 5 minutes. The system should be thread-safe and handle concurrent requests efficiently. Implement methods to record hits and get the total count within a time window.",
    examples: [
      {
        input: "Record hits at timestamps: [1, 1, 1, 300, 300, 301]",
        output: "Count at 301: 4"
      }
    ],
  },
  "design-food-ordering-system": {
    id: 5,
    title: "Design a restaurant food ordering system like Zomato, Swiggy, DoorDash",
    companies: ["Uber", "Flipkart", "ClearTax"],
    designPattern: "Observer",
    difficulty: "Medium",
    slug: "design-food-ordering-system",
    description: "Design a food ordering system that allows users to browse restaurants, place orders, track deliveries, and make payments. The system should handle order management, restaurant management, delivery tracking, and payment processing.",
    examples: [
      {
        input: "User places order from Restaurant A",
        output: "Order confirmed, estimated delivery: 30 minutes"
      }
    ],
  },
  "design-unix-find-command": {
    id: 14,
    title: "Design Unix \"find\" command for file search",
    companies: ["Amazon"],
    designPattern: "Strategy",
    difficulty: "Medium",
    slug: "design-unix-find-command",
    description: "Design a file search system similar to Unix find command. The system should support searching files by name, type, size, and modification date. Implement a flexible query interface that can combine multiple search criteria.",
    examples: [
      {
        input: "find /home -name '*.txt' -size +100k",
        output: "Found 5 files matching criteria"
      }
    ],
  },
  "design-unix-find-boolean": {
    id: 15,
    title: "Design Unix \"find\" command - with boolean predicates",
    companies: ["Amazon"],
    designPattern: "Specification",
    difficulty: "Hard",
    slug: "design-unix-find-boolean",
    description: "Extend the Unix find command design to support complex boolean predicates. The system should support AND, OR, and NOT operations to combine multiple search criteria. Implement a flexible predicate system that can be easily extended.",
    examples: [
      {
        input: "find /home -name '*.txt' AND (size > 100k OR modified < 7d)",
        output: "Found 12 files matching boolean criteria"
      }
    ],
  },
  "design-chess-game": {
    id: 8,
    title: "Design Chess Game",
    companies: ["Microsoft", "Salesforce", "Adobe"],
    designPattern: "Factory",
    difficulty: "Medium",
    slug: "design-chess-game",
    description: "Design a chess game system that can handle game state, piece movements, turn management, and game rules. The system should support two players, validate moves, detect check/checkmate, and maintain game history.",
    examples: [
      {
        input: "Move pawn from e2 to e4",
        output: "Move valid, white's turn"
      }
    ],
  },
  "design-pizza-pricing": {
    id: 18,
    title: "Design Pizza Pricing System",
    companies: ["Amazon"],
    designPattern: "Decorator",
    difficulty: "Medium",
    slug: "design-pizza-pricing",
    description: "Design a pizza pricing system that can calculate the total price of a pizza based on its base, size, and toppings. Use the Decorator pattern to add toppings dynamically and calculate the cumulative price.",
    examples: [
      {
        input: "Large Margherita + Extra Cheese + Mushrooms",
        output: "Total: $18.50"
      }
    ],
  },
  "design-pizza-pricing-followup": {
    id: 19,
    title: "Design Pizza Pricing System - Followup",
    companies: ["Amazon"],
    designPattern: "Decorator",
    difficulty: "Medium",
    slug: "design-pizza-pricing-followup",
    description: "Extend the pizza pricing system to support discounts, loyalty points, and combo deals. The system should handle multiple pricing strategies and apply them in the correct order.",
    examples: [
      {
        input: "Large Pizza with 20% discount and loyalty points",
        output: "Total: $14.40 (after discount and points)"
      }
    ],
  },
  "design-expense-sharing": {
    id: 12,
    title: "Design expense sharing app like Splitwise",
    companies: ["Salesforce", "Quince", "Flipkart"],
    difficulty: "Medium",
    slug: "design-expense-sharing",
    description: "Design an expense sharing application that allows users to split bills, track debts, and settle balances. The system should support multiple users, group expenses, and optimize settlement transactions.",
    examples: [
      {
        input: "User A paid $100, split between A, B, C",
        output: "B owes $33.33, C owes $33.33"
      }
    ],
  },
};

