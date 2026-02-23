import Header from "@/components/layout/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, ArrowRight, Lightbulb, HelpCircle, TrendingUp } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const knowledgeConcepts = [
  { id: "binary-tree", title: "Binary Trees", category: "Data Structures", difficulty: "intermediate", description: "Hierarchical structure where each node has at most two children. Fundamental for search, sort, and expression parsing.", related: ["BST", "Tree Traversal", "Heap"], mastery: 72 },
  { id: "bst", title: "Binary Search Trees", category: "Data Structures", difficulty: "intermediate", description: "A binary tree where left < parent < right. Enables O(log n) search, insert, and delete operations.", related: ["Binary Trees", "AVL Trees", "Red-Black Trees"], mastery: 58 },
  { id: "hash-table", title: "Hash Tables", category: "Data Structures", difficulty: "intermediate", description: "Key-value storage using hash functions for near O(1) lookups. Handles collisions via chaining or open addressing.", related: ["Arrays", "Hash Functions", "Sets"], mastery: 45 },
  { id: "dfs", title: "Depth-First Search", category: "Algorithms", difficulty: "intermediate", description: "Graph traversal exploring as far as possible along each branch before backtracking. Uses stack or recursion.", related: ["BFS", "Graph Traversal", "Recursion"], mastery: 65 },
  { id: "bfs", title: "Breadth-First Search", category: "Algorithms", difficulty: "intermediate", description: "Graph traversal visiting all neighbors at current depth before moving deeper. Uses a queue.", related: ["DFS", "Shortest Path", "Graph Traversal"], mastery: 60 },
  { id: "quicksort", title: "Quicksort", category: "Algorithms", difficulty: "intermediate", description: "Divide-and-conquer sorting via pivot selection. Average O(n log n), widely used in practice.", related: ["Merge Sort", "Partition", "Divide and Conquer"], mastery: 80 },
  { id: "dynamic-programming", title: "Dynamic Programming", category: "Algorithms", difficulty: "advanced", description: "Solving complex problems by breaking them into overlapping subproblems with optimal substructure.", related: ["Memoization", "Recursion", "Greedy Algorithms"], mastery: 30 },
  { id: "recursion", title: "Recursion", category: "Fundamentals", difficulty: "beginner", description: "A function calling itself to solve smaller instances of the same problem. Base case prevents infinite loops.", related: ["Stack", "DFS", "Dynamic Programming"], mastery: 85 },
  { id: "big-o", title: "Big O Notation", category: "Fundamentals", difficulty: "beginner", description: "Mathematical notation describing algorithm efficiency upper bounds as input grows.", related: ["Time Complexity", "Space Complexity", "Algorithm Analysis"], mastery: 90 },
  { id: "linked-list", title: "Linked Lists", category: "Data Structures", difficulty: "beginner", description: "Linear collection where elements point to the next. Efficient insertions and deletions.", related: ["Arrays", "Stacks", "Queues"], mastery: 88 },
  { id: "graph", title: "Graphs", category: "Data Structures", difficulty: "intermediate", description: "Nodes connected by edges representing relationships. Can be directed, undirected, weighted.", related: ["DFS", "BFS", "Trees", "Adjacency Matrix"], mastery: 50 },
  { id: "neural-network", title: "Neural Networks", category: "Machine Learning", difficulty: "advanced", description: "Computing systems inspired by biological neurons. Layers of connected nodes learn patterns from data.", related: ["Backpropagation", "Activation Functions", "Deep Learning"], mastery: 15 },
];

const didYouMeanMap: Record<string, string> = {
  "tree": "Binary Trees",
  "sort": "Quicksort",
  "search": "Depth-First Search",
  "dp": "Dynamic Programming",
  "array": "Linked Lists",
  "graph": "Graphs",
  "ml": "Neural Networks",
  "ai": "Neural Networks",
  "stack": "Recursion",
  "hash": "Hash Tables",
  "bigo": "Big O Notation",
  "complexity": "Big O Notation",
};

const trendingSearches = ["Dynamic Programming", "Graph Algorithms", "Binary Trees", "Recursion", "Big O"];

const KnowledgeSearch = () => {
  const [query, setQuery] = useState("");

  const { results, suggestion } = useMemo(() => {
    if (!query.trim()) return { results: knowledgeConcepts, suggestion: null };

    const q = query.toLowerCase().trim();
    const filtered = knowledgeConcepts.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.related.some(r => r.toLowerCase().includes(q))
    );

    let suggestion: string | null = null;
    if (filtered.length === 0) {
      const matchKey = Object.keys(didYouMeanMap).find(k => q.includes(k));
      if (matchKey) suggestion = didYouMeanMap[matchKey];
    }

    return { results: filtered, suggestion };
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto mb-10 animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Search</h1>
          <p className="text-muted-foreground mb-6">
            Explore concepts, find connections, and discover what to learn next.
          </p>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search concepts, algorithms, data structures..."
              className="pl-12 h-13 text-base rounded-xl border-2 focus-visible:border-primary"
            />
          </div>

          {/* Trending */}
          {!query && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-1">Trending:</span>
              {trendingSearches.map(t => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Did you mean */}
        {suggestion && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 animate-fade-in">
            <HelpCircle className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Did you mean{" "}
              <button onClick={() => setQuery(suggestion)} className="text-primary font-semibold hover:underline">
                {suggestion}
              </button>
              ?
            </p>
          </div>
        )}

        {/* Results */}
        <div className="max-w-3xl mx-auto space-y-3">
          {results.length === 0 && !suggestion && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No concepts found for "{query}"</p>
            </div>
          )}

          {results.map((concept, i) => (
            <div
              key={concept.id}
              className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {concept.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">{concept.category}</Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        concept.difficulty === "beginner" && "border-success/30 text-success",
                        concept.difficulty === "intermediate" && "border-warning/30 text-warning",
                        concept.difficulty === "advanced" && "border-destructive/30 text-destructive"
                      )}
                    >
                      {concept.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{concept.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Lightbulb className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {concept.related.map(r => (
                      <button
                        key={r}
                        onClick={() => setQuery(r)}
                        className="text-xs text-primary/80 hover:text-primary hover:underline"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-foreground">{concept.mastery}%</div>
                  <div className="text-xs text-muted-foreground">mastery</div>
                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden mt-1.5">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        concept.mastery >= 70 ? "bg-success" : concept.mastery >= 40 ? "bg-warning" : "bg-destructive"
                      )}
                      style={{ width: `${concept.mastery}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default KnowledgeSearch;
