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
    explanation?: string;
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
    description: "Design a parking lot system that can manage multiple types of vehicles and parking spots. The system should support different vehicle types (car, motorcycle, truck) and different spot types (compact, regular, large). Implement functionality to park vehicles, find available spots, and calculate fees based on parking duration. The system must handle edge cases such as parking lot being full, invalid vehicle types, and spot availability. Consider implementing features like finding the nearest available spot, handling multiple levels/floors, and supporting different pricing strategies for different times of day or vehicle types.",
    examples: [
      {
        input: "Park a car in a compact spot\nParkingLot lot = new ParkingLot(3, 2, 1);\nlot.parkVehicle(new Car());",
        output: "Car parked successfully in spot C1",
        explanation: "A car can park in a compact spot. The system assigns the first available compact spot (C1) to the car. This demonstrates basic parking functionality where a vehicle is successfully assigned to an appropriate spot."
      },
      {
        input: "Park a truck when only compact spots are available\nParkingLot lot = new ParkingLot(5, 0, 0);\nlot.parkVehicle(new Truck());",
        output: "No available spot for truck",
        explanation: "A truck requires a large spot, but the parking lot only has compact spots available. The system correctly rejects the parking request and returns an appropriate error message. This tests the vehicle-to-spot type compatibility validation."
      },
      {
        input: "Park multiple vehicles and calculate fees\nParkingLot lot = new ParkingLot(2, 2, 1);\nlot.parkVehicle(new Car());\nlot.parkVehicle(new Motorcycle());\nlot.unparkVehicle(vehicle1, 11:00 AM);\nlot.calculateFee(vehicle1);",
        output: "Vehicle unparked from spot C1\nTotal fee: $10.00 (2 hours at $5/hour)",
        explanation: "The system successfully manages multiple vehicles, tracks parking duration, and calculates fees based on time. A car parked for 2 hours at $5 per hour results in a $10 fee. This demonstrates time tracking and fee calculation functionality."
      }
    ],
  },
  "design-hit-counter": {
    id: 6,
    title: "Design a Hit Counter/Webpage Visits Counter - Multi-Threaded",
    companies: ["Amazon", "Adobe", "Atlassian"],
    difficulty: "Medium",
    slug: "design-hit-counter",
    description: "Design a hit counter that can count the number of hits received in the past 5 minutes (or any configurable time window). The system must be thread-safe to handle concurrent requests from multiple threads efficiently. Implement methods to record hits with timestamps and get the total count within the specified time window. The system should efficiently handle high-frequency hits, automatically expire old hits outside the time window, and provide accurate counts even under heavy concurrent load. Consider memory efficiency by cleaning up expired timestamps and handling edge cases like system clock changes or very old timestamps.",
    examples: [
      {
        input: "Record hits at timestamps: [1, 1, 1, 300, 300, 301]\nHitCounter counter = new HitCounter();\ncounter.hit(1);\ncounter.hit(1);\ncounter.hit(1);\ncounter.hit(300);\ncounter.hit(300);\ncounter.hit(301);\ncounter.getHits(301);",
        output: "Count at 301: 4",
        explanation: "Hits at timestamps 1, 1, 1, 300, 300, and 301 are recorded. When querying at timestamp 301, we count hits in the range [301-300, 301] = [1, 301], which includes timestamps 1, 1, 1, and 300 (only one 300 is counted if we're using a set, or all if using a list). This demonstrates basic hit counting within a 5-minute (300 second) window."
      },
      {
        input: "Handle hits outside the time window\nHitCounter counter = new HitCounter();\ncounter.hit(1);\ncounter.hit(100);\ncounter.hit(300);\ncounter.hit(301);\ncounter.getHits(305);",
        output: "Count at 305: 2",
        explanation: "At timestamp 305, the valid window is [305-300, 305] = [5, 305]. Hits at timestamps 1 and 100 are outside this window and should be excluded. Only hits at 300 and 301 are within the window, resulting in a count of 2. This tests the time window expiration logic."
      },
      {
        input: "Concurrent hits from multiple threads\nHitCounter counter = new HitCounter();\ncounter.hit(100);\ncounter.hit(100);\ncounter.hit(101);\ncounter.getHits(105);",
        output: "Count at 105: 3",
        explanation: "Multiple threads record hits concurrently at timestamps 100, 100, and 101. The thread-safe implementation correctly records all three hits without data loss or race conditions. When queried at timestamp 105, all hits within the window [5, 105] are counted, resulting in 3 hits. This validates thread-safety and concurrent access handling."
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
    description: "Design a comprehensive food ordering system that allows users to browse restaurants, view menus, place orders, track deliveries in real-time, and make payments. The system should handle complete order lifecycle management including order creation, confirmation, preparation, dispatch, and delivery. Implement restaurant management features for menu updates, availability tracking, and order acceptance/rejection. Include delivery tracking with real-time location updates, estimated delivery times, and delivery partner assignment. Support multiple payment methods (credit card, wallet, cash on delivery) with secure transaction processing. The system should notify users, restaurants, and delivery partners about order status changes using the Observer pattern. Handle edge cases like order cancellation, refunds, restaurant unavailability, and delivery partner assignment failures.",
    examples: [
      {
        input: "User places order from Restaurant A\nUser user = new User(\"user123\");\nRestaurant restaurant = new Restaurant(\"restaurantA\");\nOrder order = user.placeOrder(restaurant, [\"Pizza\", \"Burger\"], \"123 Main St\");",
        output: "Order confirmed, Order ID: ORD-12345\nEstimated delivery: 30 minutes\nTotal amount: $25.50",
        explanation: "A user successfully places an order with multiple items from a restaurant. The system creates an order, calculates the total amount including taxes and delivery fees, assigns a delivery partner, and provides an estimated delivery time. The restaurant, user, and delivery partner are all notified of the new order. This demonstrates the core order placement workflow."
      },
      {
        input: "Track order status through delivery stages\nOrder order = getOrder(\"ORD-12345\");\norder.getStatus(); // Initially \"CONFIRMED\"\nrestaurant.acceptOrder(order);\norder.getStatus(); // \"PREPARING\"\ndeliveryPartner.pickupOrder(order);\norder.getStatus(); // \"OUT_FOR_DELIVERY\"\ndeliveryPartner.deliverOrder(order);\norder.getStatus(); // \"DELIVERED\"",
        output: "Order Status: CONFIRMED\nOrder Status: PREPARING\nOrder Status: OUT_FOR_DELIVERY\nOrder Status: DELIVERED",
        explanation: "The order progresses through different stages: confirmed by system, accepted by restaurant, picked up by delivery partner, and finally delivered. At each stage, the Observer pattern notifies the user with real-time updates. This demonstrates state management and notification system for order tracking."
      },
      {
        input: "Handle order cancellation with refund\nOrder order = getOrder(\"ORD-12345\");\norder.cancel(\"user123\");\nPayment payment = order.getPayment();\npayment.processRefund();",
        output: "Order cancelled successfully\nRefund of $25.50 processed to original payment method\nRefund will reflect in 3-5 business days",
        explanation: "A user cancels an order before the restaurant accepts it. The system cancels the order, processes a full refund to the original payment method, and notifies both the user and restaurant. If the order was already being prepared, cancellation policies and partial refunds would apply. This tests order cancellation and refund processing logic."
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
    description: "Design a file search system similar to the Unix find command that can recursively search through directory structures. The system should support multiple search criteria including file name patterns (with wildcards and regex), file type (file, directory, symlink), file size (with operators like +, -, =), modification/access/creation dates (with relative and absolute time), permissions, and ownership. Implement a flexible query interface using the Strategy pattern that allows combining multiple search criteria. The system should efficiently traverse large directory trees, handle symbolic links appropriately, support case-sensitive and case-insensitive searches, and provide options for depth limiting, following or not following symlinks, and executing actions on found files. Consider performance optimization for large file systems and memory efficiency.",
    examples: [
      {
        input: "find /home -name '*.txt' -size +100k\nFileSearch search = new FileSearch();\nsearch.setDirectory(\"/home\");\nsearch.addCriteria(new NameCriteria(\"*.txt\"));\nsearch.addCriteria(new SizeCriteria(\">\", 100 * 1024));\nList<File> results = search.execute();",
        output: "Found 5 files matching criteria:\n/home/user1/document.txt (150KB)\n/home/user2/notes.txt (250KB)\n/home/user2/backup.txt (500KB)\n/home/user3/report.txt (120KB)\n/home/user3/data.txt (300KB)",
        explanation: "The search finds all .txt files in the /home directory (and subdirectories) that are larger than 100KB. The system recursively traverses the directory tree, applies both name pattern matching and size filtering, and returns all matching files with their sizes. This demonstrates basic multi-criteria search functionality."
      },
      {
        input: "Find files modified in last 7 days with specific permissions\nFileSearch search = new FileSearch();\nsearch.setDirectory(\"/var/log\");\nsearch.addCriteria(new ModifiedDateCriteria(\"<7d\"));\nsearch.addCriteria(new PermissionCriteria(\"644\"));\nList<File> results = search.execute();",
        output: "Found 3 files matching criteria:\n/var/log/app.log (modified: 2 days ago, permissions: 644)\n/var/log/error.log (modified: 5 days ago, permissions: 644)\n/var/log/debug.log (modified: 1 day ago, permissions: 644)",
        explanation: "The search finds files in /var/log that were modified within the last 7 days and have permissions 644 (read/write for owner, read for group and others). This demonstrates date-based filtering with relative time expressions and permission-based search criteria."
      },
      {
        input: "Find directories with depth limit and exclude patterns\nFileSearch search = new FileSearch();\nsearch.setDirectory(\"/project\");\nsearch.addCriteria(new TypeCriteria(\"directory\"));\nsearch.setMaxDepth(2);\nsearch.addExcludePattern(\"node_modules\");\nsearch.addExcludePattern(\".git\");\nList<File> results = search.execute();",
        output: "Found 8 directories matching criteria:\n/project/src\n/project/src/components\n/project/src/utils\n/project/tests\n/project/docs\n/project/config\n/project/public\n/project/scripts",
        explanation: "The search finds directories up to 2 levels deep, excluding node_modules and .git directories. This demonstrates depth limiting, type filtering, and exclusion patterns - important features for avoiding unnecessary traversal of large dependency directories or version control folders."
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
    description: "Extend the Unix find command design to support complex boolean predicates using the Specification pattern. The system should support AND, OR, and NOT operations to combine multiple search criteria, with proper operator precedence and parentheses for grouping. Implement a flexible predicate system that can parse and evaluate complex boolean expressions like (name='*.txt' AND size>100k) OR (type='directory' AND modified<7d). The system must handle nested boolean expressions, operator precedence (NOT > AND > OR), and efficiently evaluate predicates during file system traversal. Support query optimization to minimize file system operations and provide clear error messages for malformed queries. Consider implementing a query parser that converts string expressions into an abstract syntax tree (AST) for evaluation.",
    examples: [
      {
        input: "find /home -name '*.txt' AND (size > 100k OR modified < 7d)\nFileSearch search = new FileSearch();\nsearch.setDirectory(\"/home\");\nPredicate predicate = new AndPredicate(\n  new NameCriteria(\"*.txt\"),\n  new OrPredicate(\n    new SizeCriteria(\">\", 100 * 1024),\n    new ModifiedDateCriteria(\"<7d\")\n  )\n);\nsearch.setPredicate(predicate);\nList<File> results = search.execute();",
        output: "Found 12 files matching boolean criteria:\n/home/user1/document.txt (150KB, modified: 10 days ago)\n/home/user1/notes.txt (80KB, modified: 3 days ago)\n/home/user2/report.txt (200KB, modified: 15 days ago)\n... (9 more files)",
        explanation: "The search finds .txt files that are either larger than 100KB OR modified within the last 7 days. The boolean expression is evaluated as: name matches '*.txt' AND (size > 100k OR modified < 7d). Files matching the name pattern must satisfy at least one of the size or date conditions. This demonstrates complex boolean predicate evaluation with AND and OR operators."
      },
      {
        input: "Find files with NOT condition and nested grouping\nPredicate predicate = new AndPredicate(\n  new NotPredicate(new TypeCriteria(\"directory\")),\n  new OrPredicate(\n    new AndPredicate(\n      new NameCriteria(\"*.log\"),\n      new SizeCriteria(\">\", 1024 * 1024)\n    ),\n    new PermissionCriteria(\"777\")\n  )\n);",
        output: "Found 7 files matching boolean criteria:\n/var/app.log (2MB, permissions: 644)\n/var/error.log (3MB, permissions: 644)\n/tmp/test.sh (10KB, permissions: 777)\n... (4 more files)",
        explanation: "The search finds files (NOT directories) that either (are .log files larger than 1MB) OR (have permissions 777). The NOT operator excludes directories, and the nested AND/OR grouping creates complex filtering logic. This demonstrates NOT operations and nested boolean expressions with proper precedence handling."
      },
      {
        input: "Complex query with multiple levels of nesting\nPredicate predicate = new OrPredicate(\n  new AndPredicate(\n    new NameCriteria(\"*.txt\"),\n    new SizeCriteria(\"<\", 50 * 1024),\n    new ModifiedDateCriteria(\">30d\")\n  ),\n  new AndPredicate(\n    new NotPredicate(new NameCriteria(\"*.tmp\")),\n    new OrPredicate(\n      new PermissionCriteria(\"600\"),\n      new PermissionCriteria(\"644\")\n    )\n  )\n);",
        output: "Found 15 files matching boolean criteria:\n/old/archive.txt (30KB, modified: 45 days ago, permissions: 644)\n/old/backup.txt (25KB, modified: 60 days ago, permissions: 644)\n/config/settings.conf (5KB, modified: 10 days ago, permissions: 600)\n... (12 more files)",
        explanation: "This complex query finds files that match: (small old .txt files) OR (non-temporary files with specific permissions). The query demonstrates deep nesting, multiple boolean operators, and proper evaluation order. The system correctly handles operator precedence and evaluates the entire expression tree efficiently during file traversal."
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
    description: "Design a complete chess game system that can handle game state management, piece movements with validation, turn management, and comprehensive game rules. The system should support two players (white and black), validate all moves according to chess rules including piece-specific movement patterns, detect special moves (castling, en passant, pawn promotion), identify check and checkmate conditions, handle stalemate and draw scenarios, and maintain complete game history for undo/redo functionality. Use the Factory pattern to create different piece types (Pawn, Rook, Knight, Bishop, Queen, King) with their specific behaviors. Implement board representation, move validation logic that prevents illegal moves (moving into check, invalid piece movements), and game termination detection. Support features like move notation (algebraic notation), game replay, and saving/loading game states.",
    examples: [
      {
        input: "Move pawn from e2 to e4\nChessGame game = new ChessGame();\ngame.makeMove(new Move(\"e2\", \"e4\"));",
        output: "Move valid: e2 -> e4\nCurrent turn: Black\nGame status: In Progress",
        explanation: "A white pawn moves from e2 to e4, which is a valid opening move. The system validates that the move follows pawn movement rules (can move 2 squares forward on first move), updates the board state, changes the turn to black, and records the move in game history. This demonstrates basic move validation and turn management."
      },
      {
        input: "Attempt invalid move and detect check\nChessGame game = new ChessGame();\ngame.makeMove(new Move(\"e2\", \"e4\"));\ngame.makeMove(new Move(\"e7\", \"e5\"));\ngame.makeMove(new Move(\"f1\", \"c4\"));\ngame.makeMove(new Move(\"b8\", \"c6\"));\ngame.makeMove(new Move(\"d1\", \"f3\"));\ngame.makeMove(new Move(\"e8\", \"e7\"));",
        output: "Move valid: e2 -> e4\nMove valid: e7 -> e5\nMove valid: f1 -> c4\nMove valid: b8 -> c6\nMove valid: d1 -> f3\nMove invalid: Cannot move into check\nBlack is in check!\nCurrent turn: Black",
        explanation: "The game progresses with several valid moves. When black attempts to move the king to e7, the system detects that this would place the king in check (threatened by white's queen at f3) and rejects the move. The system correctly identifies that black is in check and requires a move that removes the check. This demonstrates check detection and move validation that prevents moving into check."
      },
      {
        input: "Detect checkmate\nChessGame game = new ChessGame();\ngame.makeMove(new Move(\"e2\", \"e4\"));\ngame.makeMove(new Move(\"e7\", \"e5\"));\ngame.makeMove(new Move(\"f1\", \"c4\"));\ngame.makeMove(new Move(\"b8\", \"c6\"));\ngame.makeMove(new Move(\"d1\", \"f3\"));\ngame.makeMove(new Move(\"d7\", \"d6\"));\ngame.makeMove(new Move(\"f3\", \"f7\"));",
        output: "Move valid: e2 -> e4\nMove valid: e7 -> e5\nMove valid: f1 -> c4\nMove valid: b8 -> c6\nMove valid: d1 -> f3\nMove valid: d7 -> d6\nMove valid: f3 -> f7\nCheckmate! White wins!\nGame over",
        explanation: "White executes a checkmate pattern (Scholar's Mate). The system detects that black's king is in check and has no legal moves to escape, no piece can block the check, and no piece can capture the attacking queen. The game correctly identifies checkmate, declares white as the winner, and terminates the game. This demonstrates checkmate detection and game termination logic."
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
    description: "Design a flexible pizza pricing system that can calculate the total price of a pizza based on its base type (Margherita, Pepperoni, Veggie, etc.), size (Small, Medium, Large, Extra Large), and multiple toppings. Use the Decorator pattern to dynamically add toppings to a base pizza and calculate the cumulative price. Each component (base, size modifier, toppings) should be a separate decorator that wraps the previous component and adds its own cost. The system should support adding multiple toppings, handle different pricing for different sizes, allow removal of toppings, and provide itemized pricing breakdowns. Implement proper encapsulation so that the base pizza object doesn't need to know about all possible toppings, making it easy to add new toppings or bases without modifying existing code.",
    examples: [
      {
        input: "Large Margherita + Extra Cheese + Mushrooms\nPizza pizza = new MargheritaBase();\npizza = new LargeSize(pizza);\npizza = new ExtraCheeseTopping(pizza);\npizza = new MushroomsTopping(pizza);\nSystem.out.println(\"Total: $\" + pizza.getPrice());",
        output: "Pizza: Large Margherita with Extra Cheese, Mushrooms\nBase: $8.00\nSize (Large): +$3.00\nExtra Cheese: +$2.50\nMushrooms: +$2.00\nTotal: $15.50",
        explanation: "A large Margherita pizza is created with extra cheese and mushrooms toppings. The Decorator pattern allows each component to wrap the previous one and add its cost. The base pizza ($8) is wrapped with LargeSize (+$3), then ExtraCheeseTopping (+$2.50), and finally MushroomsTopping (+$2), resulting in a total of $15.50. This demonstrates the dynamic composition of pizza components using decorators."
      },
      {
        input: "Small Pepperoni with multiple toppings\nPizza pizza = new PepperoniBase();\npizza = new SmallSize(pizza);\npizza = new OlivesTopping(pizza);\npizza = new BellPeppersTopping(pizza);\npizza = new ExtraCheeseTopping(pizza);",
        output: "Pizza: Small Pepperoni with Olives, Bell Peppers, Extra Cheese\nBase: $10.00\nSize (Small): +$0.00\nOlives: +$1.50\nBell Peppers: +$1.50\nExtra Cheese: +$2.50\nTotal: $15.50",
        explanation: "A small Pepperoni pizza is decorated with three toppings. Small size doesn't add extra cost (base price), but each topping adds its price. The decorators are applied in sequence, and each calculates the total by adding its cost to the wrapped pizza's price. This shows how multiple decorators can be chained together to build complex pizzas."
      },
      {
        input: "Compare same toppings on different sizes\nPizza small = new SmallSize(new MargheritaBase());\nsmall = new MushroomsTopping(small);\nPizza large = new LargeSize(new MargheritaBase());\nlarge = new MushroomsTopping(large);",
        output: "Small Margherita with Mushrooms: $10.00\nLarge Margherita with Mushrooms: $13.00",
        explanation: "The same base pizza and topping combination costs differently based on size. The size decorator modifies the base price, and then the topping is applied. This demonstrates that decorators can modify the behavior (pricing) of the wrapped object, and the order of decorators matters - size affects the base, and toppings are added on top of the sized pizza."
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
    description: "Extend the pizza pricing system to support various pricing strategies including percentage-based discounts, fixed-amount discounts, loyalty points redemption, combo deals, promotional codes, and seasonal offers. The system should handle multiple pricing strategies simultaneously and apply them in the correct order (typically: base price → discounts → loyalty points → taxes). Implement strategy validation to prevent negative prices, handle conflicting promotions, and ensure that discounts and loyalty points are applied correctly. Support different discount types (first-time customer, bulk orders, time-based promotions) and loyalty point systems (earn points on purchase, redeem points for discounts). The system should provide detailed pricing breakdowns showing each applied strategy and the final amount.",
    examples: [
      {
        input: "Large Pizza with 20% discount and loyalty points\nPizza pizza = new LargeSize(new MargheritaBase());\npizza = new MushroomsTopping(pizza);\nOrder order = new Order(pizza);\norder.applyDiscount(new PercentageDiscount(20));\norder.applyLoyaltyPoints(new LoyaltyPointsRedemption(100));\nSystem.out.println(\"Total: $\" + order.getTotalPrice());",
        output: "Pizza: Large Margherita with Mushrooms\nSubtotal: $13.00\nDiscount (20%): -$2.60\nAfter discount: $10.40\nLoyalty points (100 pts): -$1.00\nTotal: $9.40",
        explanation: "A large Margherita pizza with mushrooms costs $13. A 20% discount reduces it to $10.40, and then 100 loyalty points (worth $1.00) are redeemed, resulting in a final price of $9.40. The discounts are applied in the correct order: percentage discount first, then loyalty points. This demonstrates multiple pricing strategies working together."
      },
      {
        input: "Combo deal with additional discount\nPizza pizza1 = new LargeSize(new PepperoniBase());\nPizza pizza2 = new MediumSize(new MargheritaBase());\nComboDeal combo = new ComboDeal(pizza1, pizza2, new Drink(\"Coke\"));\nOrder order = new Order(combo);\norder.applyDiscount(new FixedDiscount(5.00));\norder.applyDiscount(new PercentageDiscount(10));",
        output: "Combo Deal: Large Pepperoni + Medium Margherita + Coke\nPizza 1: $13.00\nPizza 2: $11.00\nDrink: $2.00\nCombo price: $24.00 (save $2.00)\nFixed discount: -$5.00\nAfter fixed discount: $19.00\nPercentage discount (10%): -$1.90\nTotal: $17.10",
        explanation: "A combo deal includes two pizzas and a drink. The combo itself provides a discount (regular price $26, combo price $24). Then a fixed $5 discount is applied, followed by a 10% discount on the remaining amount. Multiple discounts are stacked correctly, with fixed discounts typically applied before percentage discounts to maximize customer savings while maintaining business rules."
      },
      {
        input: "Loyalty points earning and redemption in same transaction\nPizza pizza = new LargeSize(new VeggieBase());\npizza = new ExtraCheeseTopping(pizza);\nOrder order = new Order(pizza);\nLoyaltyAccount account = new LoyaltyAccount(150);\norder.applyLoyaltyPoints(new LoyaltyPointsRedemption(100));\norder.calculateLoyaltyPointsEarned();",
        output: "Pizza: Large Veggie with Extra Cheese\nSubtotal: $14.00\nLoyalty points redeemed (100 pts): -$1.00\nTotal: $13.00\nLoyalty points earned: 13 points (1 point per $1 spent)\nAccount balance: 63 points (150 - 100 + 13)",
        explanation: "A customer redeems 100 loyalty points (worth $1) on a $14 pizza, paying $13. They also earn 13 new loyalty points based on the final purchase amount. The system correctly tracks both redemption and earning in the same transaction, updating the loyalty account balance. This demonstrates bidirectional loyalty point transactions and point calculation based on final purchase price."
      }
    ],
  },
  "design-expense-sharing": {
    id: 12,
    title: "Design expense sharing app like Splitwise",
    companies: ["Salesforce", "Quince", "Flipkart"],
    difficulty: "Medium",
    slug: "design-expense-sharing",
    description: "Design a comprehensive expense sharing application that allows users to split bills, track debts between multiple users, and settle balances efficiently. The system should support individual expenses and group expenses, various split methods (equal, percentage-based, custom amounts), multiple currencies with exchange rate handling, and different split types (equally, unequally, by shares). Implement debt simplification algorithms to minimize the number of transactions needed to settle all debts (e.g., if A owes B $10 and B owes C $10, simplify to A owes C $10). Support features like expense categories, recurring expenses, expense approvals for groups, payment reminders, and transaction history. Handle edge cases like user leaving a group, expense modifications, partial payments, and currency conversions.",
    examples: [
      {
        input: "User A paid $100, split equally between A, B, C\nExpense expense = new Expense(\"Dinner\", 100.00, userA);\nexpense.splitEqually([userA, userB, userC]);\nSystem.out.println(expense.getDebts());",
        output: "Expense: Dinner - $100.00 paid by User A\nSplit equally between: A, B, C\nDebts:\n  User B owes User A: $33.33\n  User C owes User A: $33.33\n  User A owes User A: $33.33 (paid, no debt)",
        explanation: "User A pays $100 for dinner and splits it equally among three people. Each person's share is $33.33. Since A already paid, B and C each owe A $33.33. The system correctly calculates individual debts and tracks who owes whom. This demonstrates basic equal splitting functionality."
      },
      {
        input: "Multiple expenses with debt simplification\nExpense exp1 = new Expense(\"Groceries\", 60.00, userA);\nexp1.splitEqually([userA, userB]);\nExpense exp2 = new Expense(\"Uber\", 40.00, userB);\nexp2.splitEqually([userA, userB]);\nExpense exp3 = new Expense(\"Movie\", 30.00, userC);\nexp3.splitEqually([userA, userB, userC]);\nSimplifier simplifier = new DebtSimplifier();\nList<Transaction> optimized = simplifier.simplify([exp1, exp2, exp3]);",
        output: "Original debts:\n  B owes A: $30.00\n  A owes B: $20.00\n  A owes C: $10.00\n  B owes C: $10.00\n\nSimplified transactions:\n  B owes A: $10.00 (net: $30 - $20)\n  A owes C: $10.00\n  B owes C: $10.00\n\nTotal transactions reduced from 4 to 3",
        explanation: "Multiple expenses create a web of debts. The system simplifies by netting out: A and B have a net debt of B owing A $10 (B owes A $30, A owes B $20). The simplified settlement requires only 3 transactions instead of 4. This demonstrates debt simplification to minimize settlement transactions, making it easier for users to pay each other."
      },
      {
        input: "Unequal split with percentages\nExpense expense = new Expense(\"Rent\", 1200.00, userA);\nexpense.splitUnequally({\n  userA: 0.50,\n  userB: 0.30,\n  userC: 0.20\n});\nSystem.out.println(expense.getDebts());",
        output: "Expense: Rent - $1200.00 paid by User A\nSplit percentages: A (50%), B (30%), C (20%)\nDebts:\n  User B owes User A: $360.00 (30% of $1200)\n  User C owes User A: $240.00 (20% of $1200)\n  User A's share: $600.00 (already paid)",
        explanation: "Rent is split unequally based on percentages: A pays 50% ($600), B pays 30% ($360), and C pays 20% ($240). Since A paid the full amount, B owes A $360 and C owes A $240. This demonstrates percentage-based splitting for scenarios where users have different shares of an expense, such as roommates with different room sizes or income-based splits."
      }
    ],
  },
};

