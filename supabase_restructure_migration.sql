-- SQL Migration Script for Portfolio Restructuring
-- Run this inside your Supabase SQL Editor

-- 1. MODIFY BLOGS TABLE (Merge Notes capability)
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(512);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS page_count INTEGER;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content_type VARCHAR(50) DEFAULT 'article';

-- Create Index on content_type for performance
CREATE INDEX IF NOT EXISTS idx_blogs_content_type ON blogs(content_type);

-- 2. CREATE INTERVIEW QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS interview_questions (
  id VARCHAR(255) PRIMARY KEY,
  question TEXT NOT NULL,
  detailed_answer TEXT NOT NULL,
  short_answer TEXT,
  example TEXT,
  code_example TEXT,
  follow_up_questions TEXT[] DEFAULT '{}',
  related_questions TEXT[] DEFAULT '{}',
  category VARCHAR(100) NOT NULL, -- e.g. "Java", "Spring Boot", "DSA", "System Design"
  subcategory VARCHAR(100) NOT NULL, -- e.g. "OOPs", "Collections Framework", "Recursion"
  difficulty_level VARCHAR(20) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
  company_tags VARCHAR(50)[] DEFAULT '{}', -- e.g. '{"Google", "Amazon"}'
  interview_frequency VARCHAR(20) DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
  tags VARCHAR(50)[] DEFAULT '{}',
  last_updated_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  references_links TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0
);

-- Indexing for fast search and filtering on Interview Questions
CREATE INDEX IF NOT EXISTS idx_iq_category ON interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_iq_subcategory ON interview_questions(subcategory);
CREATE INDEX IF NOT EXISTS idx_iq_difficulty ON interview_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_iq_companies ON interview_questions USING gin (company_tags);
CREATE INDEX IF NOT EXISTS idx_iq_tags ON interview_questions USING gin (tags);

-- Enable pg_trgm search for questions and answers if pg_trgm is loaded
CREATE INDEX IF NOT EXISTS idx_iq_search ON interview_questions USING gin (question gin_trgm_ops, detailed_answer gin_trgm_ops);

-- 3. CREATE USER QUESTION PROGRESS TABLE (For Bookmark & Completion Tracking)
CREATE TABLE IF NOT EXISTS user_question_progress (
  id BIGSERIAL PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL, -- Unique client browser UUID or logged in user_id
  question_id VARCHAR(255) REFERENCES interview_questions(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  bookmarked BOOLEAN DEFAULT FALSE,
  favorited BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uqp_client_id ON user_question_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_uqp_question_id ON user_question_progress(question_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_progress ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate
DROP POLICY IF EXISTS "Enable read access for all users" ON interview_questions;
CREATE POLICY "Enable read access for all users" ON interview_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON user_question_progress;
CREATE POLICY "Enable read access for all users" ON user_question_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for anonymous progress tracking" ON user_question_progress;
CREATE POLICY "Enable write access for anonymous progress tracking" ON user_question_progress FOR ALL USING (true) WITH CHECK (true);

-- 5. SEED DATA FOR INTERVIEW QUESTIONS
-- Insert sample questions across Java, OOPs, Collections, Spring Boot, DSA, System Design, Frontend

INSERT INTO interview_questions (
  id, question, detailed_answer, short_answer, example, code_example, 
  follow_up_questions, related_questions, category, subcategory, 
  difficulty_level, company_tags, interview_frequency, tags, notes, references_links, sort_order
) VALUES
-- Java OOPs Q1
(
  'java-oops-diff-abstract-interface',
  'What is the difference between an Abstract Class and an Interface in Java?',
  'In Java, both abstract classes and interfaces are used to achieve abstraction, but they serve different design purposes:

1. **Multiple Inheritance**: A class can implement multiple interfaces, but can extend only one abstract class due to Java''s single-inheritance rule.
2. **State/Instance Variables**: Abstract classes can have instance variables (state) that are non-final, whereas interfaces can only have `public static final` constants.
3. **Constructors**: Abstract classes can define constructors, which are invoked when subclasses are instantiated. Interfaces cannot have constructors.
4. **Method Implementations**: Prior to Java 8, interfaces could not have any implementation. From Java 8 onwards, interfaces can define `default` and `static` methods. From Java 9, they can also have `private` methods. Abstract classes have always allowed both abstract and concrete methods.
5. **Access Modifiers**: In interfaces, all methods are implicitly `public` (though default/static methods can be private). In abstract classes, methods can have any access modifier (public, protected, package-private, private).

**When to use what**:
- Use an **Abstract Class** when you want to share a common code structure or state among closely related classes (is-a relationship).
- Use an **Interface** to define a contract or common behavior that can be implemented by completely unrelated classes (can-do relationship).',
  'An abstract class defines a base class that can hold state, constructors, and private methods, but allows only single inheritance. An interface defines a contract (behavioral blueprint) that supports multiple inheritance and is stateless.',
  'An interface `Flyable` can be implemented by both `Bird` and `Airplane`. An abstract class `Animal` can be extended by `Dog` and `Cat`.',
  '// Interface example
public interface Flyable {
    void fly();
    default void glide() {
        System.out.println("Gliding...");
    }
}

// Abstract Class example
public abstract class Animal {
    protected String name;
    public Animal(String name) {
        this.name = name;
    }
    public abstract void makeSound();
}',
  '{"What are default methods in Java 8?","Why did Java introduce private methods in interfaces in Java 9?","Can an interface extend another interface?"}',
  '{"java-oops-multiple-inheritance","java-8-functional-interface"}',
  'Java', 'OOPs', 'Beginner',
  '{"TCS", "Infosys", "Wipro", "Cognizant", "Accenture"}', 'High',
  '{"Java", "OOPs", "Abstraction"}',
  'Commonly asked for freshers and junior developers (0-3 years experience).',
  '{"https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html"}',
  1
),
-- Java OOPs Q2
(
  'java-oops-polymorphism',
  'Explain Polymorphism and the difference between Method Overloading and Method Overriding.',
  'Polymorphism is one of the core principles of OOP, meaning "many forms". It allows an entity (like a method or an object) to behave differently under different circumstances. Java supports two types of polymorphism:

1. **Compile-time (Static) Polymorphism**: Achieved via **Method Overloading**.
   - Occurs when two or more methods in the same class have the same name but different parameters (different type, number, or order).
   - Resolved by the compiler during compilation based on the method signature.
   - Return type can be different, but changing return type alone is not sufficient.

2. **Runtime (Dynamic) Polymorphism**: Achieved via **Method Overriding**.
   - Occurs when a subclass provides a specific implementation of a method that is already defined in its parent class.
   - The method in the subclass must have the exact same name, return type (or covariant return type), and parameters.
   - Resolved at runtime by the Java Virtual Machine (JVM) based on the actual object reference (Virtual Method Invocation).
   - Annotation `@Override` is recommended to prevent spelling/signature mistakes.',
  'Polymorphism means many forms. Overloading is compile-time (same name, different arguments in the same class). Overriding is runtime (same name, same arguments in subclass overriding parent class).',
  'Overloading: `calculator.add(5, 10)` vs `calculator.add(5.5, 10.5)`. Overriding: `animal.makeSound()` prints "Generic sound" while `dog.makeSound()` overrides it to print "Woof".',
  'class Calculator {
    // Overloading
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
}

class Dog extends Animal {
    // Overriding
    @Override
    public void makeSound() {
        System.out.println("Woof Woof");
    }
}',
  '{"Can we overload the main method in Java?","Can we override static methods in Java?","What is covariant return type in overriding?"}',
  '{"java-oops-diff-abstract-interface"}',
  'Java', 'OOPs', 'Beginner',
  '{"TCS", "Accenture", "Infosys", "Capgemini"}', 'High',
  '{"Java", "OOPs", "Polymorphism"}',
  'Very high frequency question across service-based and product-based companies alike.',
  '{"https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html"}',
  2
),
-- Java Collections Q1
(
  'java-collections-hashmap-concurrenthashmap',
  'What is the difference between HashMap and ConcurrentHashMap?',
  'Both `HashMap` and `ConcurrentHashMap` are key-value pair implementations, but they differ significantly in thread-safety and internal mechanics:

1. **Thread Safety**: 
   - `HashMap` is not synchronized and not thread-safe. Multiple threads accessing it concurrently can cause race conditions or corrupt the internal structure.
   - `ConcurrentHashMap` is thread-safe and allows concurrent access by multiple threads without blocking the entire map.

2. **Locking Mechanism**:
   - `HashMap` has no locking. If synchronized manually (via `Collections.synchronizedMap`), it locks the entire map, which degrades performance.
   - `ConcurrentHashMap` uses a fine-grained locking mechanism. In Java 7, it used **Segment Locking** (locking separate segments of the map). In Java 8, it uses **CAS (Compare-And-Swap) operations** and synchronized blocks on individual bucket heads. It locks only the specific bucket being modified, allowing read operations to happen without locks.

3. **Null Keys & Values**:
   - `HashMap` allows one `null` key and multiple `null` values.
   - `ConcurrentHashMap` does not allow `null` keys or `null` values (throws `NullPointerException` to avoid ambiguity in concurrent environments, known as the "Liveness" problem).

4. **Fail-Fast vs. Fail-Safe**:
   - `HashMap` iterators are **fail-fast**. If the map is modified structurally during iteration, it throws `ConcurrentModificationException`.
   - `ConcurrentHashMap` iterators are **fail-safe/weekly consistent**. They do not throw exceptions if the map is modified during iteration.',
  'HashMap is not thread-safe and allows null keys/values. ConcurrentHashMap is thread-safe, uses bucket-level locking (CAS + sync in Java 8) to allow concurrent reads/writes without locking the whole map, and forbids null keys/values.',
  'Use HashMap in single-threaded web layers or local helper methods. Use ConcurrentHashMap for global caches or shared application state accessed by multiple worker threads.',
  '// HashMap usage
Map<String, String> map = new HashMap<>();
map.put("key", null); // OK

// ConcurrentHashMap usage
Map<String, String> concurrentMap = new ConcurrentHashMap<>();
// concurrentMap.put("key", null); // Throws NullPointerException
concurrentMap.put("key", "value"); // Safe for multi-threading',
  '{"Explain segment locking in Java 7 ConcurrentHashMap vs CAS in Java 8.","Why are null keys and values not allowed in ConcurrentHashMap?","What is HashTable and how does it compare?"}',
  '{"java-collections-hashmap-internal-working"}',
  'Java', 'Collections Framework', 'Intermediate',
  '{"Amazon", "Microsoft", "Goldman Sachs", "JPMorgan Chase", "Paytm", "PhonePe"}', 'High',
  '{"Java", "Collections", "Concurrency"}',
  'Essential for mid-level developers (2-5 years experience). Focus on the locking detail differences between Java 7 and Java 8.',
  '{"https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/ConcurrentHashMap.html"}',
  3
),
-- Java Collections Q2
(
  'java-collections-hashmap-internal-working',
  'Explain the internal working of HashMap in Java. What happens in case of collisions?',
  'Java''s `HashMap` is based on hashing and operates as an array of buckets/nodes. Each bucket is represented by a `Node<K,V>` containing: `int hash`, `K key`, `V value`, and `Node<K,V> next`.

1. **How `put(K key, V value)` works**:
   - The map calculates the key''s hash value using `hash(key)`.
   - It calculates the bucket index using `index = hash & (n-1)` (where `n` is the array capacity).
   - If the bucket at the index is empty, a new Node is created and stored there.
   - If there is already a node (Collision!), it checks if the key matches (using `.equals()` and hash equality).
     - If the key matches, it overwrites the existing value.
     - If the key is different, it traverses the linked list (or Red-Black tree) to the end and appends the new node.

2. **How Collisions are Handled (Java 8 Performance Optimization)**:
   - When a collision occurs, entries are chained in a singly linked list.
   - In **Java 8**, if the number of elements in a bucket exceeds a threshold (called `TREEIFY_THRESHOLD = 8`) and the overall map capacity is at least 64, the linked list is converted into a balanced **Red-Black Tree**. This improves search time complexity in collided buckets from \(O(N)\) to \(O(\log N)\).
   - If the number of nodes in that bucket drops below `UNTREEIFY_THRESHOLD = 6` during deletion/resize, the tree is converted back into a linked list.

3. **Rehashing & Resizing**:
   - When the size of the HashMap exceeds the threshold (`capacity * load_factor`, default load factor is 0.75), the map doubles its capacity (resizes) and rehashes all existing keys to their new bucket indexes.',
  'HashMap uses an array of buckets. When a key is inserted, its index is derived from the hash of the key. In case of collision, nodes are chained in a linked list. In Java 8, if a bucket list exceeds 8 nodes and map capacity is >= 64, the list converts into a Red-Black Tree for O(log N) search.',
  'Creating a HashMap with a capacity of 16. If we insert keys that hash to the same bucket index, Java links them together. If more than 8 collide, it transforms them into a tree.',
  '// Internal representation of Node
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;
    // ... equals, hashCode
}',
  '{"What is the time complexity of HashMap get() and put() in the worst case?","Why is prime number used in hashcodes?","What is the role of load factor in HashMap?"}',
  '{"java-collections-hashmap-concurrenthashmap"}',
  'Java', 'Collections Framework', 'Intermediate',
  '{"Amazon", "Google", "Oracle", "Goldman Sachs", "Razorpay"}', 'High',
  '{"Java", "Collections", "Hashing"}',
  'Very common interview topic. Interviewers love to dig into the Red-Black tree conversion details and rehashing mechanics.',
  '{"https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html"}',
  4
),
-- Spring Boot Q1
(
  'spring-boot-bean-scopes',
  'What are the different bean scopes in Spring Framework?',
  'Spring framework allows developers to control the instantiation and lifecycle of beans via bean scopes. There are 6 main scopes:

1. **singleton** (Default): Creates a single shared instance of the bean per Spring IoC container. Every request for this bean will return the exact same instance.
2. **prototype**: Creates a new instance of the bean every time it is requested from the container. Use this for stateful beans.
3. **request** (Web-aware): Creates a single bean instance per HTTP request. The instance is destroyed when the request completes.
4. **session** (Web-aware): Creates a single bean instance per HTTP session.
5. **application** (Web-aware): Creates a single bean instance per Lifecycle of a ServletContext. Similar to singleton, but scoped to the servlet level.
6. **websocket** (Web-aware): Scopes a bean instance to the lifecycle of a WebSocket.

**Singleton beans with Prototype dependencies (Injecting Prototype into Singleton)**:
A common issue occurs when you inject a prototype bean into a singleton bean. Since the singleton bean is only instantiated once, it only gets injected with the prototype bean once, defeating the purpose of the prototype scope.
To resolve this, you can use:
- **ApplicationContext lookup** (fetches a new bean manually, but couples code to Spring).
- **`@Lookup` Annotation**: Method injection where Spring dynamically overrides a method to lookup the dependency.
- **Scoped Proxies**: Injecting a proxy of the prototype bean instead of the actual instance.',
  'Spring supports singleton (one per container - default), prototype (new instance per request), request (one per HTTP request), session (one per HTTP session), application (one per ServletContext), and websocket.',
  'A stateless Service class should be Singleton. A stateful User Cart should be Session or Prototype.',
  '@Component
@Scope("prototype")
public class StatefulCart {
    // New instance created for every dependency injection
}

@Component
@Scope("singleton") // Default
public class PaymentService {
    // Shared singleton instance
}',
  '{"How do you resolve singleton-prototype dependency injection issues?","What is the difference between singleton scope in Spring vs Singleton Design Pattern?","What are Scoped Proxies?"}',
  '{"spring-boot-bean-lifecycle"}',
  'Spring Boot', 'Bean Lifecycle', 'Intermediate',
  '{"TCS", "Cognizant", "Morgan Stanley", "JPMorgan Chase"}', 'Medium',
  '{"Spring Boot", "Spring Core", "Bean Scopes"}',
  'Important question for spring developers. Focus on singleton-prototype injection conflict resolution.',
  '{"https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-factory-scopes"}',
  5
),
-- DSA Q1
(
  'dsa-recursion-fibonacci',
  'Write a function to calculate the N-th Fibonacci number. Optimize it from O(2^N) to O(N) using recursion and memoization.',
  'The Fibonacci sequence is defined as: \(F(0) = 0\), \(F(1) = 1\), and \(F(N) = F(N-1) + F(N-2)\) for \(N \ge 2\).

1. **Naive Recursive Approach**:
   - The straightforward implementation calls `fib(n-1) + fib(n-2)`.
   - **Time Complexity**: \(O(2^N)\) because each call branches into two more calls, forming a recursion tree of height \(N\).
   - **Space Complexity**: \(O(N)\) due to the call stack depth.
   - Many sub-problems are computed repeatedly (e.g. `fib(3)` is computed multiple times in `fib(5)`).

2. **Optimized Recursion with Memoization (Top-down Dynamic Programming)**:
   - We store the results of solved sub-problems in an array or map (memo cache) and check it before performing recursive calls.
   - If `memo[n]` is already calculated, we return it instantly.
   - **Time Complexity**: \(O(N)\) because we compute the Fibonacci value for each number from 0 to N exactly once.
   - **Space Complexity**: \(O(N)\) for the memoization array and \(O(N)\) for the recursive call stack.',
  'The naive recursive Fibonacci takes O(2^N) due to redundant computations. By adding a memoization cache (array/map), we store previously computed values, reducing the time complexity to O(N).',
  'Calculating fib(5): Naive recalculates fib(2) three times. Memoized calculates fib(2) once, saves it, and retrieves it instantly next time.',
  'public class Fibonacci {
    // Memoized Recursion - O(N) Time
    public static int fib(int n, int[] memo) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n]; // Return cached result
        
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
        return memo[n];
    }

    public static void main(String[] args) {
        int n = 10;
        int[] memo = new int[n + 1];
        System.out.println(fib(n, memo)); // 55
    }
}',
  '{"What is bottom-up Dynamic Programming (Tabulation)?","How can we optimize Fibonacci space complexity to O(1)?","Explain the call stack activity during fib(4) execution."}',
  '{"dsa-dp-climbing-stairs"}',
  'DSA', 'Recursion', 'Beginner',
  '{"Amazon", "TCS", "Wipro", "Infosys"}', 'High',
  '{"DSA", "Recursion", "Dynamic Programming", "Memoization"}',
  'Great entry-level DSA question to check if the candidate understands recursion overhead and basic DP caching.',
  '{"https://en.wikipedia.org/wiki/Fibonacci_sequence"}',
  6
),
-- System Design Q1
(
  'system-design-microservices-sagas',
  'What is the Saga Pattern in Microservices and how does it maintain data consistency across services?',
  'In monolithic systems, database transactions are managed by local ACID transactions. In a distributed microservices architecture, each microservice has its own database. A transaction that spans multiple databases is called a **distributed transaction**.

Since traditional 2-Phase Commit (2PC) does not scale well in modern distributed systems, the **Saga Pattern** is used instead.

1. **What is a Saga?**
   - A Saga is a sequence of local transactions. Each local transaction updates the database inside a single service and triggers the next step in the saga via messages/events.
   - If one of the steps fails, the saga executes **compensating transactions** in reverse order to undo the changes made by the previous steps, maintaining data consistency.

2. **Two Saga Implementation Approaches**:
   - **Choreography (Decentralized)**:
     - Services communicate by publishing and subscribing to events. Each service decides what to do next based on the event received.
     - *Pros*: Simple, loose coupling.
     - *Cons*: Difficult to track workflow as services grow; cyclic dependency risk.
   - **Orchestration (Centralized)**:
     - A centralized orchestrator (Saga Orchestrator) tells each service what local transaction to execute.
     - *Pros*: Easy to understand/debug; clear dependency flow.
     - *Cons*: Single point of failure (the orchestrator); complex to set up.',
  'The Saga Pattern manages distributed transactions in microservices. It consists of a sequence of local transactions. If a step fails, Saga triggers compensating transactions to roll back previous successful steps and maintain consistency. It is implemented via Choreography (event-based) or Orchestration (central coordinator).',
  'E-commerce Checkout Saga: 1. Order Service creates pending order. 2. Payment Service debits money. 3. Inventory Service reserves stock. If stock is unavailable, Saga triggers compensating transaction to refund payment and cancel order.',
  '// Conceptual Orchestrator State Machine Pseudocode
public class OrderSagaOrchestrator {
    public void executeSaga(Order order) {
        try {
            paymentService.debit(order.getId(), order.getAmount());
            inventoryService.reserve(order.getId(), order.getItems());
            orderService.approve(order.getId());
        } catch (Exception e) {
            // Compensate
            inventoryService.release(order.getId(), order.getItems());
            paymentService.refund(order.getId(), order.getAmount());
            orderService.cancel(order.getId());
        }
    }
}',
  '{"What is a compensating transaction?","What is the difference between 2-Phase Commit (2PC) and Saga?","How do we handle idempotency in Sagas?"}',
  '{"system-design-cap-theorem"}',
  'System Design', 'HLD', 'Advanced',
  '{"Google", "Amazon", "Microsoft", "Uber", "Salesforce", "Flipkart", "Paytm"}', 'High',
  '{"System Design", "Microservices", "Saga Pattern", "Distributed Systems"}',
  'Crucial question for senior developers and system design interviews. Focus on compensating transactions and Orchestration vs Choreography.',
  '{"https://microservices.io/patterns/data/saga.html"}',
  7
);
