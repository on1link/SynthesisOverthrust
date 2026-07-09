---
description: Curated Catalog of Roles, skill, topics, and subtopics
---

# Synthesis Overthrust — Complete Skill / Topic / Subtopic Catalog

**Role codes:** MLE = Machine Learning Engineer · DS = Data Scientist · DE = Data Engineer · AIE = AI Engineer - GL = German Language - EL = English Language
**Tiers:** F = Foundational · 1t = st Tier or Entry level· 2T = 2nd Tier or Semi-senior · 2.5T = Transcend 2nd Tier or Senior · 3T = 3 Tier or Staff · 4T = 4 Tier or Advanced/Lead  

---

# TODO Skills

- Scipy
- Statmodels
- StatsForecast
- BigQuery

# Roles

## Machine Learning Engineer (MLE)

### Tier F

#### SKILL: Calculus

`Tier: F` | `Roles: MLE, DS` | **Max Level: 10** | **Prerequisites: None**

###### Topic: Limits & Continuity

- Limit definition & evaluation
- Continuity & differentiability
- L'Hôpital's rule
- Epsilon-delta intuition

###### Topic: Differentiation

- Derivatives & chain rule
- Why chain rule = backpropagation
- Computational graph mechanics
- Symbolic vs numerical differentiation
- Partial derivatives
- Gradient & directional derivative
- Automatic Differentiation (Forward vs. Reverse mode)

###### Topic: Matrix Calculus

- Numerator/Denominator layout conventions
- Identities for linear and quadratic forms
- Gradients of traces and determinants

###### Topic: Vector Calculus

- Jacobian & Hessian
- Jacobian: vector-valued function derivatives
- Hessian in model sensitivity analysis
- Hessian-free optimization methods
- Vector Calculus (Jacobians, Hessians, Divergence, Curl)

###### Topic: Integration

- Definite & indefinite integrals
- Fundamental theorem of calculus
- Integration by parts & substitution
- Multiple integrals (double, triple)

###### Topic: Optimization

- Critical points & second derivative test
- Gradient descent mechanics
- Lagrange multipliers (constrained optimization)
- Convexity & saddle points
- Proximal operators and Subgradients
- Sensitivity analysis via the Implicit Function Theorem

### SKILL: Linear Algebra

`Tier: F` | `Roles: MLE, DS` | **Max Level: 10** | **Prerequisites: Calculus Lv 3**

###### Topic: Vectors & Spaces

- Vector operations, dot & cross product
- Linear independence & span
- Basis & change of basis
- Vector spaces & subspaces
- Orthonormal bases & Gram-Schmidt process

###### Topic: Matrix Operations

- Matrix multiplication & transpose
- Element-wise vs matrix operations
- Broadcasting mechanics
- Batch operations (tensors as generalized matrices)
- Inverse & determinant
- Systems of linear equations (Gaussian elimination)
- LU, QR decompositions
- Positive Definiteness & Cholesky Decomposition

###### Topic: Norms & Projections

- Vector norms (L1, L2, L-infinity, p-norms)
- Matrix norms (Frobenius, Spectral norm)
- Orthogonal projections & Least Squares geometry
- Distance metrics & Cosine Similarity

###### Topic: Eigenstructure

- Eigenvalues & eigenvectors
- Geometric interpretation (Scaling vs Rotation)
- Characteristic polynomial
- Power iteration method
- Diagonalization
- Why diagonalization simplifies computation
- Application in PCA & covariance matrices
- SVD (Singular Value Decomposition)
- PCA from SVD
- Low-rank approximation & Matrix completion**

###### Topic: Tensors

- Rank (order/dimensionality)
- Contraction & Einstein notation
- Tensor Decomposition (CP, Tucker)
- Symmetry and anti-symmetry in tensors

###### Topic: Computational Linear Algebra

- Floating point arithmetic & precision issues**
- Condition numbers & Numerical stability
- Sparse Matrix representations (CSR, CSC, COO)
- Iterative solvers (Conjugate Gradient)

###### Topic: ML Applications

- Matrix form of linear regression
- Attention as matrix operations (Q, K, V products)
- Covariance & Correlation matrices
- Tensor operations & broadcasting in Frameworks (PyTorch/TensorFlow)
- Kernel trick and Reproducing Kernel Hilbert Spaces (RKHS)

### SKILL: Statistics

`Tier: F` | `Roles: MLE, DS, DE` | **Max Level: 10** | **Prerequisites: Calculus Lv 5**

###### Topic: Descriptive Statistics

- Central tendency & spread (mean, variance, std, IQR)
- Frequency measures
- Skewness & kurtosis
- Normality tests (Shapiro-Wilk, Q-Q plots)
- Linear & non-linear relationships (Pearson, Spearman)
- Independent & dependent variables
- Variable types (continuous, categorical, ordinal)
- Relationship direction & strength
- Visualization literacy

###### Topic: Probability

- Continuous vs discrete functions
- Random variables & distributions
- Discrete: Binomial, Poisson, Geometric
- Continuous: Uniform, Exponential, Beta, Normal
- Gaussian / normal distribution
- Bayes' theorem
- Conditional probability mechanics
- Prior, likelihood, posterior intro
- Expectation & variance

###### Topic: Inferential Statistics

- Hypothesis testing (Null vs Alternative)
- Type I & II errors (power, alpha, beta)
- Central Limit Theorem (CLT)
- Why CLT enables parametric testing
- When CLT breaks (heavy tails, small n)
- t-Test & z-Test (one-sample, two-sample, paired)
- p-value interpretation & misinterpretation
- Confidence intervals & bootstrap CI
- Regression & residuals (R², adjusted R², F-statistic)
- One-way & two-way ANOVA
- Chi-square test & Goodness of fit
- Homoscedasticity tests (Breusch-Pagan, Levene)
- Multiple comparisons (Bonferroni correction)
- Permutation tests & Bootstrap hypothesis testing

###### Topic: Sampling & Data Collection

- Simple random, stratified, and cluster sampling
- Importance sampling (Bridge to RL and Monte Carlo methods)
- Selection bias, Survivor bias, and Sampling bias

###### Topic: Bayesian Statistics Intro

- Thinking like a Bayesian (prior beliefs updated by evidence)
- Prior & posterior distributions
- Conjugate priors (Beta-Binomial, Normal-Normal)
- Bayesian credible intervals vs frequentist CI
- When Bayesian vs frequentist approach makes sense
- Bridge to full Bayesian ML skill (Senior tier)

###### Topic: Statistical Learning Theory

- Bias-variance tradeoff
- Sample size & statistical power
- Effect size (Cohen's d, η²), power analysis (1-β), MDE
- MLE (Maximum Likelihood Estimation) & MAP (Maximum A Posteriori)
- Cross-validation mechanics
- Information criteria (AIC/BIC)
- Survival analysis (Kaplan-Meier, Cox PH, time-to-event features)

###### Topic: Information Theory

- Entropy & Cross-Entropy
- KL Divergence & Jensen-Shannon Divergence
- Mutual Information for feature selection

###### Topic: Time Series Statistics

- Stationarity & Unit root tests (ADF test)
- Autocorrelation (ACF) & Partial Autocorrelation (PACF)
- Seasonality & Trend decomposition

###### Topic: Causal Inference

- Pearl’s Calculus (Do-calculus)
- Counterfactuals
- Directed Acyclic Graphs (DAGs) for causality
- Confounding and Collider bias

### SKILL: Discrete Mathematics

`Tier: F` | `Roles: MLE, DE` | **Max Level: 10** | **Prerequisites: None**

###### Topic: Set Theory & Logic

- Sets, subsets, power sets
- Set operations (union, intersection, complement)
- Propositional & predicate logic
- Proof techniques (direct, contradiction, induction)
- Boolean Algebra & Logic Gates (Optimization of binary masks/bit-manipulation)
- Relational Algebra (Foundation for SQL and Data Join logic)

###### Topic: Information Theory

- Entropy & Information Gain
- KL Divergence & Jensen-Shannon Divergence
- Mutual Information
- Cross-entropy loss foundations

###### Topic: Combinatorics & Counting

- Permutations & combinations
- Pigeonhole principle
- Inclusion-exclusion
- Applications in feature space counting and probability spaces
- Binomial and Multinomial coefficients

###### Topic: Graph Theory

- Graph definitions & types (directed, undirected, weighted)
- DAGs (Directed Acyclic Graphs) — definition, properties, and usage in data pipelines
- Graph representations (adjacency matrix vs list)
- Connectivity, paths, cycles, bipartite graphs
- Topological ordering & critical path
- Reachability & transitive closure
- Graph Centrality measures (Degree, Eigenvector, Betweenness)
- Spectral Graph Theory (Graph Laplacians - Link to Linear Algebra)

###### Topic: Number Theory & Modular Arithmetic

- Divisibility & primes
- Modular arithmetic, GCD, Euclidean algorithm
- Applications in hashing, checksums, and cryptography
- Fixed-point arithmetic & quantization logic (Kernel optimization)

###### Topic: Relations & Functions

- Relations (reflexive, symmetric, transitive)
- Equivalence classes & partitions
- Functions (injective, surjective, bijective)
- Partial orders & Lattices (Versioning and concurrency control)

###### Topic: Automata & Formal Languages

- Regular Expressions & Finite State Machines (FSM)
- Context-Free Grammars (Link to LLM Tokenization and Syntax Parsing)

### SKILL: Python

`Tier: F` | `Roles: MLE, DS, DE, AIE` | **Max Level: 10** | **Prerequisites: None**

###### Topic: Core Language & Memory

- Python syntax & logic (variables, control flow, functions, scope, error handling)
- Data Structures (lists, dicts, sets, tuples, comprehensions)
- Memory Management (Reference counting, Garbage Collection, `__slots__`)
- The Global Interpreter Lock (GIL) and its implications

###### Topic: Advanced OOP & Structural Typing

- Classes & inheritance
- Dunder methods (Data model)
- Dataclasses & ABCs (Abstract Base Classes)
- Mixins & composition
- Protocols (PEP 544 - Static Duck Typing)
- Metaclasses & Dynamic Class Creation

###### Topic: Functional Patterns

- Lambdas & decorators (Function and Class decorators)
- `map` / `filter` / `reduce`
- Closures & Scoping (`nonlocal`, `global`)
- Itertools & Functools (`partial`, `lru_cache`, `singledispatch`)

###### Topic: Generators & Low-Level Memory

- Generator expressions & `yield` / `yield from`
- Lazy evaluation mechanics
- Memory-efficient data streams
- Buffer Protocol & `memoryview` (High-performance data handling)

###### Topic: Modules, Packaging & Environments

- Module system (imports, `__init__.py`, `__all__`)
- Package structure for ML projects (src layout)
- Virtual environments (`venv`, `conda`)
- Dependency management (`pip`, `uv`, `poetry`, `pyproject.toml`)
- Namespace packages
- CI/CD for Python (Publishing to PyPI/Artifactory)

###### Topic: Type Safety & Validation

- Type hints (`typing` module, Generics, `Union`, `Optional`)
- Pydantic V2 (Schemas, validation, serialization)
- Static analysis (`mypy`, `pyright`)
- Linting & Formatting (`Ruff`, `Black`, `isort`)

###### Topic: Concurrency & Parallelism

- AsyncIO fundamentals (Event loops, `async`/`await`)
- Threading vs. Multiprocessing vs. Subprocesses
- Shared memory and Inter-process Communication (IPC)
- Use cases: Data streaming, Model serving, I/O bound tasks

###### Topic: Performance, Profiling & Extension

- Memory profiling (`Memray`, `objgraph`)
- Performance tracing (`cProfile`, `Viztracer`)
- Just-In-Time (JIT) compilation (`Numba`)
- Introduction to C-Extensions and `Cython` for ML bottlenecks
- Vectorization strategies

###### Topic: Engineering Standards & Testing

- Testing frameworks (`pytest`, `unittest`, `mocking`)
- Design Patterns in Python (Factory, Strategy, Singleton)
- Documentation (Docstrings, `Sphinx`, `MkDocs`)
- Clean Code (PEP 8, SOLID principles in Python context)

###### Topic: Essential ML/Data Ecosystem

- Data Analysis: `pandas`, `polars` (Lazy API, Expressions)
- Numerical: `numpy`, `scipy`
- Visualization: `matplotlib`, `plotly`
- Model Frameworks: `scikit-learn`, `PyTorch` (Basics of the Python API)

### SKILL: SQL

`Tier: F` | `Roles: MLE, DS, DE, AIE` | **Max Level: 10** | **Prerequisites: Discrete Mathematics Lv 5**

###### Topic: Foundations

- DDL (CREATE, ALTER, DROP)
- DML (SELECT, INSERT, UPDATE, DELETE)
- Filtering, sorting, GROUP BY, HAVING
- Common Table Expressions (CTEs) & Recursive CTEs
- Data Types & Constraints (NULLs, Primary/Foreign Keys)

###### Topic: Joins & Set Operations

- INNER / LEFT / RIGHT / FULL joins
- Self-joins & Cross joins
- UNION / INTERSECT / EXCEPT
- Subqueries (Correlated vs. Non-correlated)
- Shutterstock

###### Topic: Window Functions

- ROW_NUMBER, RANK, DENSE_RANK
- LAG / LEAD (Time-series feature engineering)
- Running totals & moving averages
- PARTITION BY semantics
- Sessionization patterns (30-min gaps)
- Frame Specifications (ROWS/RANGE BETWEEN)

###### Topic: Performance & Design

- Query execution plans (EXPLAIN ANALYZE)
- Indexing strategies (B-Tree, Hash, GIN for JSONB)
- Query optimization (Predicate pushdown, join reordering)
- Normalization vs. Denormalization (Star, Snowflake, OBT)
- Transactions & ACID / isolation levels
- Partitioning & Sharding strategies

###### Topic: Advanced Data Handling for ML

- Vector SQL (pgvector, ANN search, Distance metrics: L2, Cosine)
- Semi-structured data (JSONB, VARIANT, nesting/unnesting logic)
- UDFs (User Defined Functions) for custom feature logic
- Full-Text Search integration

###### Topic: Cloud Query Engines & Feature Stores

- AWS Athena (Serverless SQL on S3/Glue)
- BigQuery (Columnar storage, Slots, Partitioning/Clustering)
- Snowflake (Micro-partitions, Time Travel, Zero-copy cloning)
- Integration with Feature Stores (e.g., Feast, Tecton SQL definitions)

### SKILL: DSA

`Tier: F` | `Roles: MLE, DS, DE` | **Max Level: 10** | **Prerequisites: Python Lv 3 OR Discrete Mathematics Lv 4**

###### Topic: Core Data Structures

- Arrays, linked lists, stacks, queues

- Hash maps & collision strategies

- Trees (BST, AVL, Red-Black)

- Heaps & priority queues

- **Tries (Prefix trees for tokenization and autocomplete)**

- **Disjoint Set Union (DSU / Union-Find)**

###### Topic: Graph Structures & Algorithms

- Representation (adjacency list/matrix)

- BFS & DFS

- Shortest paths (Dijkstra, Bellman-Ford, __A_ Search_*)

- Topological sort & SCC (Strongly Connected Components)

- **Graph Sampling techniques (Link to GNNs)**

- DAG prerequisite: Discrete Math → Graph Theory

###### Topic: Algorithm Design Patterns

- Two pointers & sliding window

- Divide & conquer

- Dynamic programming (memoization vs tabulation)

- Greedy & backtracking

- Recursion, sorting, search

- Bit manipulation

- Segment trees & Binary Indexed Trees (FAANG)

- **Probabilistic Data Structures (Bloom Filters, Count-Min Sketch)**

- **Reservoir Sampling (Handling large-scale data streams)**

###### Topic: Complexity Analysis

- Big-O, Big-Θ, Big-Ω

- Time vs space tradeoffs

- Amortized analysis

- NP-completeness basics

- **Complexity of Matrix operations (Link to Linear Algebra)**

###### Topic: Distributed Algorithms (Intro)

- **Consistent Hashing mechanics**

- **MapReduce logic and shuffle/sort phases**

- **Vector clocks and logical time basics**

### SKILL: Systems Fundamentals

`Tier: F` | `Roles: MLE, DE` | **Max Level: 10** | **Prerequisites: None**

###### Topic: Memory Architecture

- Stack vs heap

- Virtual memory & address space

- Memory layout (code, data, BSS, heap, stack)

- Cache hierarchy (L1/L2/L3, locality)

- **Paging & TLB (Translation Lookaside Buffer)**

- **NUMA (Non-Uniform Memory Access) awareness**

###### Topic: Concurrency & Synchronization

- Threads vs processes

- Race conditions & data races

- Mutex, semaphore, spinlock

- Deadlock, livelock, starvation

- **Atomic operations & Compare-and-Swap (CAS)**

- **Memory barriers & Memory ordering (Relaxed vs Sequential Consistency)**

- **Lock-free vs Wait-free data structures basics**

###### Topic: Memory Management

- Manual allocation (malloc/free, new/delete)

- Garbage collection strategies (Tracing, Reference Counting)

- Ownership models (Rust borrow checker)

- Memory leaks & tools (Valgrind, AddressSanitizer)

- **RAII (Resource Acquisition Is Initialization)**

- **Custom allocators (Arena, Pool allocators for ML workloads)**

###### Topic: I/O & System Calls

- File descriptors & buffering

- Blocking vs non-blocking I/O

- System calls (read, write, mmap)

- Signals & process management

- **Event-driven I/O (epoll/kqueue/io_uring)**

- **Zero-copy techniques (sendfile, splice)**

###### Topic: Hardware Acceleration (MLE Focus)

- **CPU SIMD instructions (AVX, SSE)**

- **GPU Architecture basics (SMs, Global vs Shared Memory)**

- **PCIe bandwidth & Latency bottlenecks**

- **TPU/NPU high-level execution flow**

###### Topic: OS & Runtime Internals

- **Context switching overhead**

- **Process scheduling & Priority (NICENESS)**

- **Shared libraries & Dynamic linking (ELF format)**

- **Linux Cgroups & Namespaces (Foundations of Containers)**

### Tier 1

### SKILL: Technical Communication

`Tier: 1T` | `Roles: MLE, DS, AIE` | **Max Level: 5** | **Prerequisites: English or German Lv 7 (Professional Proficiency)**

###### Topic: ML Communication

- Explaining ML concepts to non-technical stakeholders (Intuition vs. Math)

- Visual design for ML results (Confusion matrices, ROC curves, Feature importance)

- Slide preparation for ML projects (Storytelling with data)

- Writing ML system design documents (ADRs, RFCs)

- **Metric selection for business impact (ROI, KRs vs. model metrics)**

- **Model interpretability communication (SHAP/LIME explanation for business users)**

###### Topic: Interview Readiness

- Coding & ML interviews (Python, SQL, ML models)

- DS + ML system design interviews (Scalability, Latency, Data Drift)

- Live coding preparation (LeetCode, Interview Query)

- **Behavioral interviews (STAR method, Conflict resolution, Ownership)**

- **Whiteboard architectural drawing & system walk-throughs**

###### Topic: Technical Writing & Documentation

- **Clear PR descriptions and commit messages**

- **Writing User Guides and API documentation (Swagger/Redoc)**

- **Internal Wiki management (Confluence/Notion) for model lineage**

###### Topic: Stakeholder Management

- **Expectation setting for experimental uncertainty**

- **Communicating project risks and "No-Go" decisions**

- **Cross-functional collaboration (PMs, Backend, DevOps)**

### SKILL: NoSQL Databases

`Tier: 1T` | `Roles: DE, MLE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 5, SQL Lv 5**

###### Topic: Distributed Systems Theory

- **CAP Theorem (Consistency, Availability, Partition Tolerance)**
- **BASE vs. ACID consistency models**

- **PACELC Theorem**

- **Replication strategies (Leader-follower, Multi-leader, Leaderless)**

- **Quorum reads/writes and Tunable Consistency**

###### Topic: Key-Value & Caching

- DynamoDB (Fast lookups, Single-table design, TTL)

- Redis (Data structures: Strings, Hashes, Lists, Sets, Sorted Sets)

- **Redis as a Feature Store for low-latency ML inference**

- Caching patterns (Cache-aside, Write-through, Write-behind)

- Pub-Sub and Streams in Redis

###### Topic: Document Stores

- MongoDB (BSON, Flexible schema, Aggregation pipeline)

- **Indexing strategies in Document DBs (Compound, TTL, Geospatial)**

- **Change Streams for real-time data synchronization**

- Semi-structured data patterns and JSON modeling

###### Topic: Column-Family (Wide-Column) Stores

- Cassandra / ScyllaDB (LSM-trees, Write-optimization, Partitioning)

- HBase (Integration with HDFS/Hadoop ecosystem)

- **Compaction strategies and SSTables**

- Time-series workloads and data modeling (Row key design)

###### Topic: Search Engines & Inverted Indexes

- Elasticsearch / OpenSearch (Inverted index, Sharding, Replicas)

- Query DSL and Full-text search mechanics

- **ELK Stack for log analytics and observability**

- **Relevance scoring (BM25, TF-IDF)**

###### Topic: Vector Databases (MLE Priority)

- **Vector Indexing (HNSW, IVF-Flat, PQ - Product Quantization)**

- **Distance metrics (Cosine, Euclidean, Dot Product)**

- **Managed vs. Self-hosted: Pinecone, Weaviate, Milvus, Qdrant**

- **Integration with LLM frameworks (LangChain, LlamaIndex) for RAG**

###### Topic: Graph Databases

- Neo4j (Cypher query language, Graph traversal)

- **Graph data modeling (Nodes, Relationships, Properties)**

- **Graph DB use cases: Fraud detection, Knowledge Graphs, RecSys**

- Cross-ref: Discrete Math → Graph Theory

###### Topic: Strategy & Operations

- **Polyglot Persistence (Choosing the right tool for the job)**

- **Data Migration patterns (Online vs. Offline)**

- **Monitoring NoSQL performance (IOPS, Latency, Throughput)**

### SKILL: Experimentation

`Tier: 1T` | `Roles: DS, MLE` | **Max Level: 10** | **Prerequisites: Statistics Lv 7**

###### Topic: A/B Testing Foundations

- Experiment design (units of randomization, metrics, salt/hashing)

- A/A testing (sanity check, variance estimation, distribution validation)

- Statistical power & sample size calculation (MDE, Alpha, Beta)

- Pitfalls: Novelty effect, Primacy effect, Simpson's Paradox

- **The Peeking Problem & Fixed-horizon testing limitations**

###### Topic: Sequential & Adaptive Testing

- SPRT (Sequential Probability Ratio Test)

- Always-valid inference (Confidence sequences)

- Multi-armed bandits (Epsilon-greedy, UCB, Thompson sampling)

- **Contextual Bandits (Exploration vs. Exploitation in RecSys)**

- **Bayesian A/B Testing (Probability of being best, Expected Loss)**

###### Topic: Advanced Experiment Analysis

- CUPED (Controlled-experiment Using Pre-Experiment Data) & Variance reduction

- CUPAC (Covariate-Adjusted patterns)

- Stratification (Pre vs. Post)

- Heterogeneous Treatment Effects (HTE) & Subgroup analysis

- Long-term effect estimation (Surrogates, long-term holdouts)

- **Interference & Network Effects (SUTVA violations, cluster randomization)**

###### Topic: Causal Inference & Quasi-Experiments

- **Difference-in-Differences (Diff-in-Diff)**

- **Regression Discontinuity Design (RDD)**

- **Synthetic Control Methods**

- **Propensity Score Matching (PSM) & Inverse Probability Weighting**

- **Instrumental Variables (IV)**

###### Topic: Metrics & Product Strategy

- **Metric hierarchy (North Star, Driver, Guardrail, Counter-metrics)**

- **Sensitivity vs. Robustness of metrics**

- **Proxy metrics & Validation (Surrogates)**

- **Defining "Success" for non-binary outcomes**

###### Topic: Platform & Engineering

- Experiment logging & Assignment systems (Bucketing logic)

- Feature flags & Gradual rollout strategies (Canary, Blue/Green)

- Metric pipelines & Automated guardrail monitoring

- **Interaction effects across concurrent experiments (Orthogonal layers)**

- **Self-serve experimentation UI & Analytics automation**

### SKILL: Data Engineering

`Tier: 1T` | `Roles: DE, MLE, DS` | **Max Level: 10** | **Prerequisites: Python Lv 6, SQL Lv 8, Systems Fundamentals Lv 6, Discrete Mathematics Lv 5**

###### Topic: Data Warehouse & Lakehouse

- OLTP vs OLAP design principles

- Snowflake (virtual warehouses, Snowpark, cost management, semi-structured data)

- Databricks & Delta Lake (Spark, ACID, Z-ordering, Unity Catalog)

- BigQuery (slots, columnar, partitioning, BigQuery ML)

- Redshift & S3/HDFS data lakes

- Lakehouse patterns (Bronze/Silver/Gold Medallion architecture)

- **Table Formats (Apache Iceberg, Apache Hudi, Delta Lake internals)**

- **Compute vs. Storage decoupling mechanics**

###### Topic: Data Modeling

- Dimensional modeling fundamentals (Kimball methodology)

- Star schema design (fact tables, dimension tables)

- Snowflake schema (normalized dimensions)

- Data Vault methodology (hubs, links, satellites)

- Slowly Changing Dimensions (SCD Types 1, 2, 3, 4, 6)

- Normalization vs denormalization trade-offs

- Schema evolution & backward compatibility

- **One Big Table (OBT) for Analytics & ML feature sets**

- **Temporal Modeling & Bi-temporal data**

###### Topic: Data Ingestion & ETL

- Batch ingestion patterns

- ETL vs ELT paradigm shift

- Change data capture (CDC) patterns (Debezium, Log-based)

- Schema evolution & data contracts

- AWS Glue (Crawlers, Jobs, Catalog)

- File formats (CSV, JSON, Parquet, Avro, ORC)

- **Zero-ETL integration patterns**

- **API-based ingestion (REST, GraphQL, Webhooks)**

###### Topic: Data Transformation

- dbt core (models, sources, macros, tests, lineage)

- SQL transformation patterns

- Incremental models & SCD types

- Data quality (Great Expectations, Deequ, Soda)

- **Vector transformations for Embedding storage**

- **Materialized Views & Query Rewrite logic**

###### Topic: Streaming Data

- Kafka (topics, partitions, consumers, KSQL, Kafka Connect)

- Spark (RDDs, DataFrames, SparkSQL, Catalyst, MLlib)

- Flink (stateful ops, windowing, event time, late data)

- Streaming vs micro-batch semantics

- **Kappa Architecture vs Lambda Architecture**

- **Schema Registry (Confluent/AWS) & Serialization (Protobuf/Avro)**

- **Watermarking & Exactly-once processing guarantees**

###### Topic: Pipeline Orchestration

- Airflow (DAG anatomy, TaskFlow API, XComs, K8s operator)

- **Dagster (Asset-based orchestration & Software-defined assets)**

- Prefect & modern orchestration alternatives

- Pipeline design patterns (idempotency, backfill, atomicity)

- Data lineage & observability

- Workflow versioning (GitOps, DVC)

- **Dynamic Task Mapping & Conditional execution**

###### Topic: Metadata & Governance

- Data catalog concepts (discoverability, ownership)

- OpenMetadata, Apache Atlas, DataHub

- Data lineage graph design

- Data contracts & schema registry

- Column-level lineage

- Data governance frameworks

- **RBAC/ABAC and Data Masking/Hashing**

- **PII Detection & Automated Classification**

###### Topic: Storage Engines & Performance (New)

- **LSM-trees vs B-Trees for ingestion/query trade-offs**

- **Sharding, Partitioning, and Clustering strategies**

- **Compression algorithms (Snappy, Gzip, Zstd, LZO)**

- **Cold vs. Hot storage tiering (S3 Intelligent-Tiering)**

### SKILL: Mathematical Optimization

`Tier: 1T` | `Roles: MLE, AIE` | **Max Level: 10** | **Prerequisites: Calculus Lv 7, Linear Algebra Lv 6**

###### Topic: Foundations

- Objective function, constraints, feasible region

- Local vs global optima

- Convex vs non-convex problems

- Duality (Lagrangian, KKT conditions, primal/dual, strong/weak duality)

- **Stationarity, Primal/Dual Feasibility, and Complementary Slackness**

###### Topic: Linear Programming (LP)

- LP formulation & standard form

- Simplex method mechanics

- Sensitivity analysis & shadow prices

- LP in ML (L1 regularization as LP, basis pursuit)

- **Interior point methods for LP**

###### Topic: Convex Optimization

- QP, QCQP, SOCP, SDP hierarchy

- SVM as a Quadratic Programming (QP) problem

- **Proximal Operators & Proximal Gradient Descent (ISTA/FISTA)**

- **Coordinate Descent algorithms**

- Tooling (CVXPY, SCS, MOSEK, Gurobi)

###### Topic: Stochastic & First-Order Optimization (MLE Core)

- **Stochastic Gradient Descent (SGD) mechanics**

- **Momentum, RMSProp, and Adam/AdamW**

- **Learning rate schedules and Warm-up strategies**

- **Lookahead and Nesterov Accelerated Gradient (NAG)**

###### Topic: Second-Order & Quasi-Newton Methods

- **Newton’s Method for optimization**

- **Secant equation & Quasi-Newton updates (BFGS, L-BFGS)**

- **Trust Region vs. Line Search methods**

- **Hessian-free optimization (Truncated Newton)**

###### Topic: Non-convex & Combinatorial

- Integer programming (ILP, MIP)

- Branch & bound / Branch & cut basics

- Heuristics (Simulated annealing, Genetic algorithms)

- **Global optimization (Bayesian Optimization, Particle Swarm)**

###### Topic: Distributed & Large-Scale Optimization

- **Alternating Direction Method of Multipliers (ADMM)**

- **Data-parallel vs. Model-parallel optimization**

- **Asynchronous SGD and Parameter Servers**

- **Federated Optimization (FedAvg)**

###### Topic: ML Applications

- Neural network training as non-convex optimization

- Hyperparameter optimization (BO, CMA-ES)

- Optimal transport & Wasserstein distance

- Policy gradient as optimization in Reinforcement Learning

- **Hardware-Aware Optimization (Quantization-aware training, Pruning as constrained optimization)**

### SKILL: Stochastic Processes & Simulation

`Tier: 1T` | `Roles: DS, MLE` | **Max Level: 10** | **Prerequisites: Statistics Lv 7, Calculus Lv 6, Linear Algebra Lv 5**

###### Topic: Probability Foundations

- Random variables & distributions (discrete & continuous)

- Expectation, variance, moment generating functions

- Law of large numbers & CLT

- Conditional expectation & independence

- **Characteristic functions and Convergence of random variables**

###### Topic: Stochastic Processes

- Markov chains (discrete & continuous time)

- **Transition matrices, Chapman-Kolmogorov equations**

- **Stationary distributions, Ergodicity, and Absorbing states**

- Poisson processes & Exponential distribution relationship

- Brownian motion & Wiener process

- Martingales & optional stopping

- **Random Walks (Simple, Biased, and on Graphs)**

###### Topic: Simulation Methods

- Monte Carlo fundamentals

- Variance reduction (Importance sampling, Antithetic variates, **Control variates**)

- MCMC (Metropolis-Hastings, Gibbs sampling)

- **Hamiltonian Monte Carlo (HMC) & NUTS (No-U-Turn Sampler)**

- Bootstrapping & permutation tests

- **Quasi-Monte Carlo (Latin Hypercube Sampling, Sobol sequences)**

###### Topic: Applied Stochastic Models

- Hidden Markov Models (HMMs) — **Forward/Backward, Viterbi, Baum-Welch**

- Queueing theory basics (Little's Law, M/M/1 queues)

- Stochastic differential equations (Itô basics, Euler-Maruyama method)

- Bayesian filtering (Kalman, Extended Kalman, Particle filters)

- **Gaussian Processes (Kernels, Mean/Covariance functions, GPR)**

###### Topic: Performance & Implementation

- **Vectorized sampling (NumPy/PyTorch/Jax distributions)**

- **Pseudorandom vs. Cryptographic vs. Quasi-random generators**

- **Parallelizing Monte Carlo simulations**

### SKILL: Machine Learning Classical

`Tier: 1T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: Statistics Lv 6, Linear Algebra Lv 6, Python Lv 5**

###### Topic: Statistical Foundations

- Statistical & foundational techniques in ML

- Role of statistics in ML (Inference vs. Prediction)

- Parametric vs. non-parametric methods

- Assumptions underlying ML models (IID, Normality, Homoscedasticity)

- Independent & dependent variables in ML context

- Features (X) vs. target (y) framing

- Variable selection principles (Parsimony vs. Predictive power)

- Defining models (function approximation framing)

- Model capacity & inductive bias

- Hypothesis class & complexity

- **Empirical Risk Minimization (ERM) & Structural Risk Minimization**

###### Topic: Learning Paradigms

- Labeled data (annotation strategies, active learning intro)

- Supervised learning (Generalization, Overfitting, Underfitting)

- Unsupervised learning (Structure discovery, Density estimation)

- Semi-supervised learning: Self-training, co-training, pseudo-labeling, label propagation

- **Self-supervised learning:** Pretext tasks (Rotation, Jigsaw), Contrastive learning (SimCLR, MoCo), Masked autoencoders

- Relation to foundation models & pre-training

- Reinforcement learning intro (Agent, Environment, Reward loop)

###### Topic: Supervised Learning — Linear & Kernel Models

- Linear regression (OLS, coefficient interpretation, Gauss-Markov theorem)

- Logistic regression (Sigmoid function, Log-odds, Maximum Likelihood Estimation)

- **Generalized Linear Models (GLMs) & Link functions**

- Naive Bayes (Conditional independence assumption)

- **Support Vector Machines (SVMs):** Hard vs. Soft margin, Dual formulation, **Kernel Trick** (RBF, Polynomial)

- k-Nearest Neighbors (kNN): Distance metrics, curse of dimensionality

###### Topic: Supervised Learning — Tree-Based & Ensembles

- Decision trees (ID3, C4.5, CART)

- **Splitting criteria:** Gini Impurity, Information Gain (Entropy), MSE

- **Bagging:** Random Forests (Feature subsampling, out-of-bag error)

- **Boosting:** AdaBoost, Gradient Boosting Machines (GBM)

- **High-performance implementations:** XGBoost (Weighted Quantile Sketch), LightGBM (GOSS, EFB), CatBoost (Symmetric trees)

- Stacking & Blending (Meta-learners)

###### Topic: Regularization & Optimization

- Why regularization? (Bias-Variance Tradeoff)

- L1 (Lasso) — Sparsity inducing & Feature selection

- L2 (Ridge) — Weight shrinkage & Grouping effect

- Elastic Net (L1 + L2 combination)

- Early stopping & Data augmentation

- **Bayesian interpretation: L2 as Gaussian Prior, L1 as Laplace Prior**

###### Topic: Unsupervised Learning

- **Clustering:** k-means (Lloyd's algorithm), DBSCAN (Density-based), Hierarchical (Agglomerative)

- **Dimensionality Reduction:** PCA (Eigen-decomposition), LDA (Class separation), **t-SNE & UMAP** (Non-linear manifold learning)

- Gaussian Mixture Models (GMMs) & EM Algorithm

- Anomaly detection (Isolation Forests, One-class SVM, Local Outlier Factor)

###### Topic: Model Evaluation & Validation

- Hold-out split vs. K-Fold Cross-Validation

- Stratified splitting & GroupKFold (handling data groups)

- **Data Leakage:** Target leakage, Temporal leakage, Train-test contamination

- **Classification Metrics:** Precision-Recall tradeoff, F1, ROC-AUC, Log Loss, **Calibration (Platt Scaling, Isotonic Regression)**

- **Regression Metrics:** MAE, RMSE, R², Adjusted R², MAPE

- **Imbalanced Data:** SMOTE, ADASYN, Cost-sensitive learning, Precision-Recall curves vs. ROC

- **Business Alignment:** Expected Value Framework, Cost-Benefit Matrices

###### Topic: Feature Engineering & Preprocessing

- **Encoding:** One-hot, Ordinal, **Target Encoding (with Smoothing/Leave-one-out to prevent leakage)**

- **Embeddings:** Entity embeddings for categorical data

- **Numerical:** Scaling (MinMax, Standard), Power transforms (Box-Cox, Yeo-Johnson), Binning

- **Missing Data:** Simple imputation vs. Iterative/KNN imputation, Missingness indicators

- **Feature Selection:** Filter (Chi-square), Wrapper (RFE), Embedded (Lasso, Tree-importance)

- Feature stores & offline-online consistency

###### Topic: scikit-learn & Engineering

- Estimator API (`fit`, `predict`, `transform`)

- **Pipelines & ColumnTransformer (Preventing leakage in CV)**

- Custom transformers (Inheriting `BaseEstimator`, `TransformerMixin`)

- Model persistence (`joblib`, `pickle`) & ONNX conversion

###### Topic: Recommender Systems

- Problem framing (Retrieval vs. Ranking)

- Explicit vs. Implicit feedback (Confidence weighting)

- **Collaborative Filtering:** User-based, Item-based, Matrix Factorization (SVD, ALS, iALS)

- **Content-based Filtering:** TF-IDF, Word2Vec/Doc2Vec feature extraction

- **Hybrid Systems:** Switching, Weighted, Feature Augmentation

- **Deep RecSys:** Two-tower models (User/Item embeddings), Neural Collaborative Filtering

- **Learning to Rank (LTR):** Pointwise, Pairwise (RankNet), Listwise (LambdaMART)

- **Advanced RecSys:** Session-based (RNN/Transformer), Knowledge Graph Embeddings (TransE)

- **Evaluation:** Hit Rate@K, NDCG, Mean Reciprocal Rank (MRR)

### SKILL: ML Project Lifecycle

`Tier: 1T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: Python Lv 6, ML Classical Lv 3, SQL Lv 3**

###### Topic: Defining an ML Problem

- Business problem → ML problem translation

- Is ML the right solution? (Rule #1: Don't use ML if a heuristic suffices)

- Scoping & success metrics (Business KPIs vs. Model metrics)

- Stakeholder alignment (defining ground truth, performance baselines, ROI)

- Problem types taxonomy (classification, regression, ranking, generation)

- Online vs offline prediction, batch vs real-time

- **Cost-Benefit Analysis & Compute Budgeting**

- **Baseline Selection (Heuristics, Constant models, Simple Linear models)**

###### Topic: Data Acquisition & Governance

- Data source identification (internal DBs, third-party, scraping, APIs)

- Synthetic data generation (cross-ref Gen AI)

- Active learning (query by committee, uncertainty sampling)

- Crowdsourcing & labeling pipelines, data flywheel

- Data quality assessment (completeness, consistency, sampling bias)

- Schema validation (Great Expectations, Pydantic)

- **Data Privacy & Compliance (GDPR/CCPA basics, PII masking)**
- **Data Contracts (MLE-DE interface agreements)**

###### Topic: Exploratory Data Analysis (EDA)

- EDA in the ML lifecycle context
- Hypothesis generation from data

- Feature-target relationship analysis (Correlation, Mutual Information)

- Data distribution shifts (Train vs. Production / Covariate shift)

- Multicollinearity detection

- **Preliminary Feature Importance (SHAP/LIME in the EDA phase)**

###### Topic: Model Training & Experimentation

- Training pipeline anatomy

- Data loading & batching (Iterators, Prefetching)

- Forward pass, loss computation, backpropagation & parameter update

- Epoch, iteration, step definitions

- Experiment management (MLflow, W&B, Reproducibility)

- Iterative improvement loop (Error analysis, Augmentation decisions)

- **Distributed Training Foundations (Data vs. Model Parallelism basics)**

###### Topic: Model Evaluation (Lifecycle)

- Offline vs online evaluation distinction

- A/B testing for model evaluation

- Shadow mode evaluation (Dark launches)

- Evaluation on subgroups (Slicing analysis for fairness and edge cases)

- Trade-offs in evaluation metrics (Business vs. Technical)

- Backtesting pipelines, counterfactual evaluation, simulation

- **Model Calibration (Expected Calibration Error - ECE)**

- **Model Signature & Contract validation**

###### Topic: End-to-End Machine Learning Systems

- Full pipeline: data → model → serving → monitoring

- ML system components map (The "Hidden Technical Debt" landscape)

- From notebook to production path (Refactoring, Modularization)

- Feature pipeline design (Online vs. Offline / Point-in-time joins)

- Model versioning (Model cards, Semantic versioning, Rollback)

- Common failure modes in production ML (Feedback loops, Training-Serving skew)

- **CI/CD/CT (Continuous Integration, Deployment, and Training)**

###### Topic: Deployment & Inference Environments

- Cloud environments (AWS SageMaker, GCP Vertex AI, Azure ML)

- Local environments (Docker for local parity, GPU setup, Dev→Staging→Prod)

- On-device / Edge ML (TF Lite, ONNX Runtime, Core ML)

- When on-device makes sense (Latency, Privacy, Offline)

- Model compression for edge (Quantization, Pruning, Distillation)

- **Inference Patterns (Serverless, Async/Queue-based, Synchronous REST/gRPC)**

- **Autoscaling & Resource Optimization (CPU/GPU/Memory balancing)**

### SKILL: Data Science Workflow

`Tier: 1T` | `Roles: DS, MLE` | **Max Level: 10** | **Prerequisites: Python Lv 4, Statistics Lv 4, SQL Lv 3**

###### Topic: Exploratory Data Analysis (EDA)

- Univariate analysis (distributions, outliers, missingness patterns)

- Bivariate & multivariate analysis

- Distribution plots (KDE, violin, ECDF)

- Relationship plots (scatter matrix, heatmap, pairplots)

- Temporal & geospatial EDA

- EDA-driven hypothesis generation

- **Dimensionality reduction for visualization (t-SNE, UMAP basics)**

- **Correlation & Collinearity analysis (VIF, Correlation matrices)**

###### Topic: Data Cleaning & Preprocessing

- Missing data strategies (MCAR/MAR/MNAR diagnosis)

- **Advanced Imputation (KNN, MICE, IterativeImputer)**

- Outlier detection & treatment (Statistical vs. Model-based)

- Type coercion & schema enforcement

- Deduplication strategies (Fuzzy matching, Record linkage)

- String cleaning & normalization (Regex, Lemmatization)

- **Feature Scaling & Normalization (Standard, Robust, Log-transforms)**

###### Topic: Anomaly Detection

- Statistical methods (Z-score, IQR, GESD)

- Isolation Forest & LOF (Local Outlier Factor)

- Autoencoders for anomaly detection (Reconstruction error analysis)

- Time-series anomaly detection (STL decomposition, ADTK)

- Evaluation (precision@k, recall@k, labeling challenges)

- **Monitoring: Data Drift & Concept Drift detection**

###### Topic: Model Interpretability & Explainability

- **Global vs. Local explainability concepts**

- **SHAP (Shapley Additive Explanations) & Bee-swarm plots**

- **LIME (Local Interpretable Model-agnostic Explanations)**

- **Partial Dependence Plots (PDP) & ALE plots**

- **Permutation Feature Importance vs. Model-native Importance**

###### Topic: Domain Applications

- Fraud Detection (class imbalance, graph-based, real-time scoring)

- Customer Analytics (segmentation RFM, churn, LTV, attribution)

- AdTech & Programmatic Bidding (CTR prediction, budget pacing)

- E-commerce & RecSys Applications (product ranking, personalization)

- **Logistics & Supply Chain (Demand forecasting, safety stock optimization)**

- **Cybersecurity (Log analysis, intrusion detection)**

### SKILL: Software Engineering for ML

`Tier: 1T` | `Roles: MLE, DS, DE, AIE` | **Max Level: 10** | **Prerequisites: Python Lv 6**

###### Topic: Version Control

- Git fundamentals (add, commit, branching, core commands)

- Conventional Commits spec

- Trunk-based development & GitFlow

- GitHub workflows (fork, PR, issues, milestones)

- **Git for data & model versioning (DVC, LakeFS)**

- **GitOps & CI pipeline triggers**

###### Topic: Testing

- Unit testing (pytest) — fixtures, parametrize, mocking

- Integration testing — pipeline, API contract, E2E

- ML-specific testing (model behavior, data validation, performance regression, shadow mode)

- Test-Driven Development (TDD) for ML

- **Property-based testing (Hypothesis) for data edge cases**

###### Topic: Environment Management & Containers

- Virtual environments (pyenv, venv, conda)

- Dependency management (Poetry, pip-tools, uv)

- Docker for ML (Dockerfile, Docker Compose, multi-stage, GPU passthrough)

- Reproducibility patterns (lock files, env-as-code)

- **Container Registry management & Image scanning**

###### Topic: CI/CD & Automation

- GitHub Actions (workflows, matrix builds, secrets, reusable)

- GitLab CI patterns

- Pre-commit hooks & linting

- Automated test gates

- Deployment pipelines (CD)

- **Continuous Training (CT) triggers & Automated Retraining**

###### Topic: Code Quality & Architecture

- Code reviews (ML code checklist, PR hygiene, notebooks vs modules)

- Refactoring ML code (notebook → module)

- Type hints, PEP8, docstrings, Pydantic

- Code smell detection in DS workflows

- **Design Patterns for ML (Factory, Strategy, Adapter for models/data loaders)**

- **SOLID principles in the context of ML systems**

- **Hexagonal Architecture (Ports and Adapters) for ML services**

###### Topic: API Development & Serving

- **RESTful API design (FastAPI, Flask)**

- **gRPC for high-performance inference communication**

- **Request/Response validation (Pydantic)**

- **Asynchronous task queues (Celery, Redis) for long-running inference**

###### Topic: Logging & Observability

- **Structured logging (JSON format, context propagation)**

- **Metrics collection (Prometheus, custom model metrics)**

- **Distributed Tracing (OpenTelemetry)**

- **Monitoring dashboards (Grafana, ELK stack)**

###### Topic: Documentation & Distribution

- **Technical writing for ML (README, Wiki, ADRs)**

- **Documentation engines (Sphinx, MkDocs)**

- **Packaging (pyproject.toml, building wheels, private PyPI)**

### SKILL: Dev Principles

`Tier: 1T` | `Roles: MLE, DE, AIE` | **Max Level: 10** | **Prerequisites: Software Engineering for ML Lv 6**

###### Topic: Clean Code Principles

- SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)

- DRY (Don't Repeat Yourself) — including in ML pipelines

- KISS & YAGNI

- Code smell detection (long methods, feature envy, data clumps)

- **Composition over Inheritance**

- **Effective Naming & Intent-revealing code**

- **Separation of Concerns (Logic vs. Data vs. Infrastructure)**

###### Topic: Design Patterns

- Creational (Factory, Builder, Singleton)

- Structural (Adapter, Decorator, Facade)

- Behavioral (Strategy, Observer, Template Method)

- **Patterns in ML pipeline construction (Pipeline, Estimator patterns)**

- **Model Registry & Feature Store Access Patterns**

- **Anti-patterns in ML (The "Big Glue" code, Dead Experimental Paths)**

###### Topic: Software Architecture

- Layered Architecture (Controller, Service, Gateway) applied to ML serving

- Hexagonal Architecture (Ports & Adapters) / Clean Architecture

- Event-driven architecture basics (Pub-Sub, Event Sourcing)

- Architecture Decision Records (ADRs)

- **Monoliths vs. Microservices for ML deployments**

- **Contract-First Development & API Versioning**

- **Sidecar patterns for model logging and monitoring**

###### Topic: Refactoring

- Extract method, extract class

- Notebook → module refactoring

- Incremental refactoring with test coverage

- **Refactoring for Performance vs. Readability**

- **Handling Legacy ML codebases & Technical Debt repayment**

###### Topic: Engineering Culture & Standards

- **Code Review best practices for ML (Focus on logic, data handling, and testability)**

- **Static Analysis integration (SonarQube, custom linting for ML frameworks)**

- **Documentation as Code (ADRs, Swagger, and auto-generated API docs)**

### Tier 2

### SKILL: Kubernetes

`Tier: 2T` | `Roles: MLE, DE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 6**

###### Topic: Core Primitives

- Pods, ReplicaSets, Deployments

- Services (ClusterIP, NodePort, LoadBalancer) & Ingress

- ConfigMaps & Secrets

- Namespaces & ResourceQuotas

###### Topic: Storage & Networking

- PersistentVolumes (PV) & PersistentVolumeClaims (PVC), StorageClasses

- Network policies (Egress/Ingress rules)

- DNS within cluster (CoreDNS)

- **Service Mesh basics (Istio/Linkerd for mTLS and traffic splitting)**

###### Topic: Operations & Scaling

- `kubectl` patterns and advanced filtering (`-o jsonpath`, `custom-columns`)

- Rolling updates & rollbacks (Strategy: RollingUpdate vs Recreate)

- Resource limits (CPU/Memory) & Requests

- Autoscaling: Horizontal Pod Autoscaler (HPA), Vertical Pod Autoscaler (VPA), Cluster Autoscaler

- Health checks: Liveness, Readiness, and Startup probes

###### Topic: Scheduling & Node Management

- **Node Affinity & Anti-affinity**

- **Taints & Tolerations**

- **PriorityClasses & Preemption**

- **Static Pods & DaemonSets**

###### Topic: ML-Specific Kubernetes (MLE Priority)

- **GPU Scheduling & Device Plugins (NVIDIA/AMD)**

- **Multi-Instance GPU (MIG) configuration**

- **Batch Scheduling (Volcano, Kueue)**

- **Inference Serving (KServe, Seldon Core, BentoML on K8s)**

- **KubeFlow basics (Pipelines, Training Operators)**

###### Topic: Ecosystem & Governance

- Helm charts (Templating, Values, Charts, Subcharts)

- RBAC (Roles, ClusterRoles, RoleBindings) & Service Accounts

- Monitoring (Prometheus / Grafana) & Logging (Fluentd/ELK)

- **Admission Controllers (Opa Gatekeeper / Kyverno)**

- **GitOps for K8s (ArgoCD / Flux basics)**

### SKILL: Computer Vision

`Tier: 2T` | `Roles: MLE, AIE, DS` | **Max Level: 10** | **Prerequisites: Deep Learning Lv 5, Linear Algebra Lv 5**

###### Topic: Classical CV

- Image representation (pixels, channels, histograms)

- Filtering & convolution (Gaussian, Sobel, Laplacian)

- Feature detection (SIFT, ORB, Harris corners)

- Traditional pipelines (HOG + SVM, watershed)

- **Image geometry (Affine, Perspective transforms, Homography)**

- **Color space theory (RGB, HSV, Lab, YUV)**

###### Topic: Deep CV — Classification

- CNN architecture patterns (VGG, ResNet, EfficientNet)

- **Mobile-friendly architectures (MobileNetV2/V3, ShuffleNet, GhostNet)**

- Transfer learning & fine-tuning strategies

- Common image datasets (ImageNet, CIFAR, COCO, Open Images)

- Data augmentation (Geometric, Color jitter, Mixup, CutMix)

- Evaluation (Top-k accuracy, Confusion matrix, F1-score)

###### Topic: Deep CV — Detection & Segmentation

- Anchor-based detection (Faster R-CNN, SSD)

- **Anchor-free detection (YOLOv8+, CenterNet, FCOS)**

- Semantic vs. Instance segmentation (U-Net, Mask R-CNN)

- **Panoptic segmentation & Boundary refinement**

- Metrics: mAP@IoU, Precision-Recall curves, FPS/Latency

- **Loss functions: Focal Loss, GIoU/DIoU/CIoU**

###### Topic: Generative Models in CV

- GANs (StyleGAN3, DCGAN, CycleGAN, Pix2Pix)

- Diffusion models (DDPM, Stable Diffusion, ControlNet)

- VAEs for vision & Latent space manipulation

- **Image-to-Image translation & Super-resolution (SRGAN)**

###### Topic: Self-supervised CV

- DINO & DINOv2 (Self-distillation for visual features)

- MAE (Masked Autoencoders) for vision

- CLIP pre-training (Contrastive Language-Image Pre-training)

- Contrastive learning (MoCo, SimCLR, BYOL)

- Downstream task transfer & Zero-shot evaluation

###### Topic: Video & Temporal Understanding

- **Optical Flow (Lucas-Kanade, FlowNet, RAFT)**

- **Object Tracking (DeepSORT, ByteTrack, Norfair)**

- **Action Recognition (3D Convolutions, SlowFast, Video Transformers)**

- **Temporal Consistency in video generation/editing**

###### Topic: OCR & Document Understanding

- Classical OCR (Tesseract, Preprocessing/Binarization)

- Deep learning OCR (CRNN + CTC Loss, Attention-based)

- Layout analysis & Document parsing (LayoutLM)

- Production OCR pipelines & AWS Textract integration

###### Topic: Vision Engineering & Deployment (MLE Priority)

- **Hardware Acceleration (TensorRT, OpenVINO, ONNX Runtime)**

- **Quantization (INT8 calibration) & Pruning for Vision**

- **Video pipeline optimization (GStreamer, NVIDIA DeepStream)**

- **Memory-efficient inference (Tiling for high-res images)**

###### Topic: Advanced Topics

- Vision Transformers (ViT, Swin Transformer, DINO)

- Multimodal models (CLIP, Flamingo, LLaVA)

- **Segment Anything Model (SAM) & SAM 2**

- **Neural Radiance Fields (NeRF) & 3D Gaussian Splatting**

- 3D vision (Depth estimation, Point clouds, SLAM basics)

### SKILL: NLP (Natural Language Processing)

`Tier: 2T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: Deep Learning Lv 5, Statistics Lv 7, Python Lv 6**

###### Topic: NLP Foundations

- Text as sequence of symbols vs. continuous data

- Ambiguity: Lexical, Syntactic, Semantic, Pragmatic

- Curse of dimensionality in text

- Language as probability distributions over sequences

- Morphology, syntax, semantics, pragmatics

- Constituency & dependency parsing

- **Coreference resolution (Anaphora, Cataphora)**

- NLP task taxonomy (Classification, Generation, Extraction, Translation)

- Discriminative vs. Generative NLP models

- **Statistical Language Models (N-grams, Smoothing, Back-off)**

###### Topic: Text Preprocessing & Vectorization

- Tokenization (Rule-based, BPE, WordPiece, **Tiktoken/Byte-level BPE**)

- Normalization (Lowercasing, Stemming, Lemmatization)

- Stop word removal & noise cleaning

- Handling unstructured text (Encoding, HTML, Unicode)

- Feature extraction (TF-IDF, BoW, n-grams)

- **Subword modeling & Out-of-Vocabulary (OOV) handling**

###### Topic: Classical NLP & Information Extraction

- Text classification pipeline end-to-end

- Sentiment analysis (Lexicon-based vs. ML-based)

- Named Entity Recognition (NER) (CRF-based, Entity-level F1)

- Topic modeling (LDA, NMF, Coherence scores)

- **Relation Extraction & Knowledge Graph Construction**

- **Pattern matching & Regex for structural extraction**

###### Topic: Neural NLP & Attention

- Word embeddings (Word2Vec, GloVe, FastText)

- RNN & LSTM for NLP (Seq2Seq, Vanishing gradients, Bidirectional)

- Language modeling & Perplexity

- **Attention Mechanisms (Self-attention, Cross-attention, Multi-head attention)**

- **Positional Encoding & Scaled Dot-Product Attention**

###### Topic: Encoder Models (BERT Family)

- BERT architecture (Bidirectional Encoder, MLM + NSP)

- WordPiece tokenization, [CLS] & [SEP] tokens

- BERT variants (RoBERTa, ALBERT, DistilBERT, **SpanBERT**)

- Fine-tuning BERT (Classification, NER, SQuAD for QA)

- **Sentence-BERT (SBERT) & Bi-encoders for semantic similarity**

###### Topic: Decoder Models (GPT Family)

- GPT architecture (Autoregressive / Causal LM, Decoder-only)

- **KV-Caching for efficient inference**

- GPT variants (GPT-2, GPT-3, GPT-4 family)

- Open-source alternatives (LLaMA, Mistral, **Falcon**)

- **In-context learning (Zero-shot, Few-shot, Chain-of-Thought)**

###### Topic: Retrieval-Augmented Generation (RAG)

- **Retrieval vs. Generation trade-offs**

- **Dense Retrieval (Semantic Search) vs. Sparse Retrieval (BM25)**

- **Vector Databases for NLP (FAISS, Pinecone, Milvus)**

- **Chunking strategies & Metadata filtering**

- **Re-ranking models (Cross-encoders)**

###### Topic: Multilingual & Cross-lingual NLP

- Multilingual BERT (mBERT) & XLM-RoBERTa

- Cross-lingual transfer learning & Language detection

- Zero-shot cross-lingual transfer

- **Byte-level tokenization for multilingual robustness**

- **Low-resource language adaptation (Back-translation, Synthetic data)**

###### Topic: Document Understanding

- Layout-aware models (LayoutLM, LayoutLMv3)

- Multi-page document processing & Table extraction

- Form understanding & Key-value extraction

- **Visual Question Answering (VQA) on documents**

- Cross-ref: Computer Vision → OCR

###### Topic: NLP Evaluation & Alignment

- **Foundational Metrics:** BLEU, ROUGE, METEOR, Perplexity

- **Model-based Metrics:** BERTScore, BLEURT

- **LLM-as-a-Judge (GPT-4 evaluation patterns)**

- **Alignment foundations:** RLHF basics, DPO (Direct Preference Optimization)

- **Detecting Hallucinations & Factuality checking**

###### Topic: Speech & Audio

- Speech recognition pipeline (Acoustic + Language model)

- MFCC & Spectrograms (Audio features)

- ASR evaluation (WER, CER)

- AWS Transcribe & Whisper patterns

- **Text-to-Speech (TTS) & Phoneme representation**

### SKILL: MLOps

`Tier: 2T` | `Roles: MLE, DE, AIE` | **Max Level: 10** | **Prerequisites: Python Lv 8, Kubernetes Lv 5, ML Classical Lv 5**

###### Topic: Experiment Tracking & Reproducibility

- MLflow (Tracking API, Projects, Model Registry, Pipelines)

- Weights & Biases (W&B) for artifact logging and sweeps

- Reproducibility: Deterministic seeds, config management (Hydra, OmegaConf), environment pinning

- Experiment design: Hyperparameter optimization strategies (Bayesian, Hyperband)

###### Topic: Feature Store Architecture

- Feature store components: Online (low-latency) vs. Offline (analytical) stores

- **Point-in-time correctness (Avoiding temporal data leakage)**

- Feature TTL (Time-to-Live) & Freshness monitoring

- Feast (Open-source) vs. Managed (Tecton, SageMaker Feature Store)

- **Feature sharing, discoverability, and versioning**

- Online serving latency requirements and caching

###### Topic: Model Registry & Governance

- Model versioning: Semantic versioning for model weights and artifacts

- Stage transitions: Development → Staging → Production → Archived

- **Approval workflows, automated gating, and model lineage**

- Model Metadata: Data + Code + Config + Environment hash

- A/B model routing and traffic splitting via registry

- Integration with CI/CD for automated deployment triggers

###### Topic: Pipelines & Orchestration

- Airflow: DAG design, operators, and scheduling

- **KubeFlow Pipelines (KFP): Components, SDK, and Argo/Tekton backends**

- **DVC (Data Version Control) & Pachyderm for dataset/model lineage**

- DAG design patterns: Idempotency, backfilling, and atomicity

- **TFX (TensorFlow Extended) components**

###### Topic: Model Serving & Inference

- REST API & gRPC patterns for high-throughput inference

- FastAPI for ML: Pydantic schemas, async endpoints, and dependency injection

- **Batch vs. Real-time vs. Streaming inference**

- Model serialization: ONNX, TorchScript, TensorRT, OpenVINO

- Latency & Throughput profiling (p99 latency, RPS)

- **Model Quantization and Pruning for production efficiency**

###### Topic: Cloud ML Platforms

- SageMaker: Training jobs, Pipelines, Endpoints, and Feature Store

- Vertex AI: Workbench, Model Registry, and Vertex Pipelines

- AWS Glue/Athena integration for serverless ML data prep

###### Topic: ML Observability & Monitoring

- SLA / SLO / SLI for ML systems (Availability vs. Model Quality)

- **Data Drift: Covariate shift, Label shift, and Concept drift**

- Detection methods: KS Test, PSI (Population Stability Index), Chi-square, Embedding drift

- **Data Quality SLOs: Schema validation, null rates, and distribution checks**

- Model performance degradation (Precision/Recall decay in production)

- **Shadow Mode (Dark Launch) & Champion-Challenger patterns**

- **Self-healing: Automated retraining triggers and fallback models**

###### Topic: CI/CD/CT for ML (LLMOps Included)

- **Continuous Training (CT): Automated pipelines triggered by data drift**
- Model validation gates: Unit tests, integration tests, and behavioral tests
- GitHub Actions for ML (CML - Continuous Machine Learning)
- Deployment strategies: Blue/green, Canary, and Shadow deployments
- **Infrastructure as Code (Terraform, Pulumi) for ML resources**
- **LLMOps Specifics: Prompt versioning, RAG evaluation (Ragas), vLLM, and Ray Serve**

###### Topic: Security, Compliance & Optimization

- Authentication: OAuth2, JWT, IAM roles
- Encryption at rest and in transit
- **RBAC (Role-Based Access Control) for model and data access**
- **Cost Optimization: Spot instances for training, Graviton/ARM for inference**
- Audit trails for model decisions and training data

### SKILL: Graph Machine Learning

`Tier: 2T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: ML Classical Lv 5, Deep Learning Lv 5, Discrete Mathematics Lv 4**

###### Topic: Graph Fundamentals for ML

- Graph representation for ML (node features, edge features, graph features)
- Homogeneous vs. heterogeneous graphs
- Temporal graphs & dynamic graphs
- Graph sampling strategies (Random walk, Neighbor sampling)
- **Spectral vs. Spatial graph representations**
- **Graph Laplacians & Eigen-decomposition**
- **Inductive vs. Transductive learning settings**
- Graph datasets (Cora, Citeseer, OGB benchmarks)

###### Topic: Graph Neural Networks (GNNs)

- Message passing framework (Aggregate → Combine → Update)
- Graph Convolutional Networks (GCN)
- GraphSAGE (Inductive learning, neighborhood sampling)
- Graph Attention Networks (GAT)
- Graph Isomorphism Network (GIN — WL-test expressivity)
- **Readout & Pooling functions (Global vs. Hierarchical pooling)**
- Expressive power & Weisfeiler-Leman (WL) hierarchy

###### Topic: Advanced GNN Architectures

- Heterogeneous GNNs (R-GCN, HGT)
- Temporal GNNs (TGN, DyRep)
- Graph Transformers (Graphormer, GPS)
- Scalable GNNs (ClusterGCN, GraphSAINT)
- **Equivariant Graph Neural Networks (E-GNNs)**
- Over-smoothing & over-squashing problems (and mitigation via Residuals/JK-Nets)

###### Topic: Graph Self-supervised Learning (SSL)

- Link prediction pre-training
- Contrastive learning on graphs (GraphCL, GRACE)
- Graph autoencoders (GAE, VGAE)
- **Masked Graph Modeling (GraphMAE)**
- Cross-ref: Deep Learning → Self-supervised

###### Topic: GNN Applications

- Fraud detection on transaction graphs (Cycle detection, Community detection)
- Molecular property prediction & Drug discovery
- Knowledge graph completion (TransE, RotatE)
- RecSys with graph structure (PinSage, LightGCN)
- **Supply Chain & Logistics optimization (Routing/Resource allocation)**

###### Topic: Evaluation & Tooling

- Node, edge, graph-level task metrics
- PyTorch Geometric (PyG)
- Deep Graph Library (DGL)
- **Distributed GNN training (DGL-DistGraph, PyG-Dist)**
- **Explainability in GNNs (GNNExplainer, Subgraph attribution)**
- OGB (Open Graph Benchmark)

### SKILL: Graph Machine Learning

`Tier: 2T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: ML Classical Lv 5, Deep Learning Lv 5, Discrete Mathematics Lv 4**

###### Topic: Graph Fundamentals for ML

- Graph representation for ML (node features, edge features, graph features)
- Homogeneous vs. heterogeneous graphs
- Temporal graphs & dynamic graphs
- Graph sampling strategies (Random walk, Neighbor sampling)
- **Spectral vs. Spatial graph representations**
- **Graph Laplacians & Eigen-decomposition**
- **Inductive vs. Transductive learning settings**
- Graph datasets (Cora, Citeseer, OGB benchmarks)

###### Topic: Graph Neural Networks (GNNs)

- Message passing framework (Aggregate → Combine → Update)
- Graph Convolutional Networks (GCN)
- GraphSAGE (Inductive learning, neighborhood sampling)
- Graph Attention Networks (GAT)
- Graph Isomorphism Network (GIN — WL-test expressivity)
- **Readout & Pooling functions (Global vs. Hierarchical pooling)**
- Expressive power & Weisfeiler-Leman (WL) hierarchy

###### Topic: Advanced GNN Architectures

- Heterogeneous GNNs (R-GCN, HGT)
- Temporal GNNs (TGN, DyRep)
- Graph Transformers (Graphormer, GPS)
- Scalable GNNs (ClusterGCN, GraphSAINT)
- **Equivariant Graph Neural Networks (E-GNNs)**
- Over-smoothing & over-squashing problems (and mitigation via Residuals/JK-Nets)

###### Topic: Graph Self-supervised Learning (SSL)

- Link prediction pre-training
- Contrastive learning on graphs (GraphCL, GRACE)
- Graph autoencoders (GAE, VGAE)
- **Masked Graph Modeling (GraphMAE)**
- Cross-ref: Deep Learning → Self-supervised

###### Topic: GNN Applications

- Fraud detection on transaction graphs (Cycle detection, Community detection)
- Molecular property prediction & Drug discovery
- Knowledge graph completion (TransE, RotatE)
- RecSys with graph structure (PinSage, LightGCN)
- **Supply Chain & Logistics optimization (Routing/Resource allocation)**

###### Topic: Evaluation & Tooling

- Node, edge, graph-level task metrics
- PyTorch Geometric (PyG)
- Deep Graph Library (DGL)
- **Distributed GNN training (DGL-DistGraph, PyG-Dist)**
- **Explainability in GNNs (GNNExplainer, Subgraph attribution)**
- OGB (Open Graph Benchmark)

### SKILL: Rust

`Tier: 2T` | `Roles: MLE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 7, DSA Lv 5, Python Lv 6**

###### Topic: Ownership System

- Ownership & move semantics
- Borrowing & references (Shared vs. Mutable)
- Lifetimes (Annotations, Elision rules, `'static`)
- The borrow checker mental model
- **Smart Pointers (`Box`, `Rc`, `Arc`, `Cell`, `RefCell`)**
- **Interior Mutability pattern**

###### Topic: Type System & Functional Patterns

- Structs, Enums, and Data modeling
- Traits & Generics (Trait bounds, Orphan rule)
- Pattern matching & Control flow
- Error handling (`Result`, `Option`, `?` operator)
- **Derive macros and Attribute macros**
- **Closures & Iterators (Lazy evaluation, Adaptors)**

###### Topic: Concurrency & Asynchronous Programming

- Threads & Message passing (`mppc` channels)
- Shared state with `Mutex`, `RwLock`, and `Arc`
- `async`/`await` syntax & `Tokio` runtime
- `Send` & `Sync` traits (Thread safety guarantees)
- **Fearless Concurrency patterns in Data Processing**
- **Actor model basics in Rust**

###### Topic: Systems Programming & Memory

- FFI (Foreign Function Interface) & `unsafe` blocks
- Memory layout, alignment, and `repr(C)`
- **Zero-copy deserialization (`Serde`, `Bincode`)**
- Build system (Cargo, features, workspaces)
- SIMD & Auto-vectorization
- **Manual memory management (Allocators, `Layout`)**

###### Topic: Python Integration (MLE Core)

- **PyO3: Writing Python extensions in Rust**
- **Maturin: Building and publishing Rust-Python packages**
- **Type conversion between Python and Rust (`PyObject`, `IntoPy`)**
- **Handling the GIL (Global Interpreter Lock) from Rust**

###### Topic: Performance & Profiling

- **Benchmarking with `Criterion`**
- **Profiling with Flamegraphs & `Valgrind`**
- **Inlining and Monomorphization overhead**
- **Optimization levels and Link-Time Optimization (LTO)**

### SKILL: C++

`Tier: 2T` | `Roles: MLE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 7, DSA Lv 5, Python Lv 6**

###### Topic: Memory Management & Ownership

- Pointers, references, and address-of operators
- **Stack vs. Heap allocation**
- **RAII (Resource Acquisition Is Initialization) & Resource Management**
- Smart Pointers (`std::unique_ptr`, `std::shared_ptr`, `std::weak_ptr`)
- Manual memory management (`new`/`delete`, `malloc`/`free`)
- **Memory alignment & Padding**

###### Topic: Modern C++ (C++11 to C++20)

- **Move Semantics & R-value references (`std::move`, `std::forward`)**
- Type inference (`auto`, `decltype`)
- Lambda expressions & Functional objects
- **Contexpr & Compile-time evaluation**
- Structured bindings & Initializer lists
- **C++20 Concepts & Ranges**

###### Topic: Object-Oriented & Generic Programming

- Classes, Inheritance, and Polymorphism (`virtual` functions, VTables)
- **Templates (Function/Class templates, Variadic templates)**
- Template Metaprogramming (SFINAE, `std::enable_if`)
- **The STL (Standard Template Library): Containers, Iterators, and Algorithms**
- **Effective C++ Patterns (Rule of Three/Five/Zero)**

###### Topic: Concurrency & Systems

- Threads (`std::thread`, `std::jthread`)
- **Atomics & Memory Barriers**
- Mutexes, Condition Variables, and Locks
- **Asynchronous programming (`std::future`, `std::promise`, `std::async`)**
- **Lock-free data structures basics**

###### Topic: ML & High-Performance Computing (MLE Core)

- **SIMD Intrinsics (AVX, SSE) & Vectorization**
- **C++ Extensions for Python (Pybind11, CFFI)**
- **Working with LibTorch (PyTorch C++ Frontend)**
- **TensorRT C++ API for high-performance inference**
- **CUDA C++ basics (Kernels, Thread blocks, Shared memory)**
- **ONNX Runtime C++ Integration**

###### Topic: Engineering & Build Systems

- **Compilers (GCC, Clang, MSVC) & Optimization flags (`-O3`, `-march=native`)**
- **Build Systems (CMake, Bazel, Make)**
- **Package Management (Conan, vcpkg)**
- **Debugging & Profiling (GDB, Valgrind, Perf, Google Benchmark)**

### SKILL: Time Series

`Tier: 2T` | `Roles: DS, MLE` | **Max Level: 10** | **Prerequisites: Statistics Lv 7, ML Classical Lv 6, Python Lv 6**

###### Topic: Foundations

- Stationarity & unit root tests (ADF, KPSS)
- Autocorrelation (ACF / PACF)
- Decomposition (Trend, Seasonality, Residuals)
- Resampling, rolling windows, lag features
- `shift()`, `rolling()`, `expanding()` patterns
- NumPy: percentiles, IQR outlier detection
- **Fractional Differencing (Stationarity vs. Memory preservation)**
- **Fourier Transforms & Periodograms for seasonality detection**

###### Topic: Classical Forecasting

- ARIMA & SARIMA (Identification, Estimation, Diagnosis)
- Exponential smoothing (ETS, Holt-Winters)
- VAR (Vector Autoregression) for multivariate series
- **State Space Models (Kalman Filters, Structural Time Series)**
- Forecast evaluation (MAE, RMSE, MASE, CRPS, **sMAPE**)
- **Theta method & Bagged ETS**

###### Topic: ML-based Forecasting

- Feature engineering for tabular models (Calendar, Lag, Rolling, Fourier features)
- Gradient boosting for TS (LightGBM/XGBoost specific patterns)
- Global models (one model for many series) vs. Local models
- Walk-forward cross-validation (**Backtesting strategies & Expanding windows**)

- **Multi-step strategies: Recursive, Direct, and Hybrid forecasting**

###### Topic: Deep Learning Forecasting

- Seq2seq architectures & Dilated convolutions (WaveNet)

- Temporal Fusion Transformer (TFT) — Variable selection & Gating

- N-BEATS & N-HiTS (Basis functions & Multi-rate sampling)

- PatchTST & iTransformer

- **DeepAR (Probabilistic forecasting with RNNs)**

- **TS Foundation Models: TimeGPT, Chronos, Lag-Llama**

- Probabilistic forecasting & Conformal intervals (Quantile regression)

###### Topic: Anomaly Detection & Structural Breaks

- **Change Point Detection (PELT, Binary Segmentation, Bottom-up)**

- **Interrupted Time Series Analysis (Causal Impact)**

- **Dynamic Time Warping (DTW) for series similarity/clustering**

- **STL-based and Isolation Forest for TS anomalies**

### SKILL: Deep Learning

`Tier: 2T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: Calculus Lv 7, Linear Algebra Lv 8, ML Classical Lv 5, Python Lv 6**

###### Topic: Neural Network Fundamentals

- Forward pass mechanics & Computational graphs

- Activation functions (ReLU, GELU, Sigmoid, Tanh, SiLU, Softmax)

- Backpropagation algorithm & Chain rule application

- Weight initialization (Xavier/Glorot, He initialization)

- Gradient flow, Vanishing & Exploding gradients

- Perceptrons, Multi-Layer Perceptrons (MLP)

- **Universal Approximation Theorem**

###### Topic: Training Dynamics & Optimization

- Optimizers (SGD, Momentum, RMSProp, Adam, AdamW)

- Learning rate schedules (Cosine annealing, Warmup, Cyclical, ReduceLROnPlateau)

- Regularization (Dropout, Stochastic Depth, Weight decay, L1/L2)

- **Sharpness-Aware Minimization (SAM) & Stochastic Weight Averaging (SWA)**

- **Normalization techniques:**

  - Batch Normalization (Internal covariate shift)

  - Layer Normalization (Transformers/NLP)

  - Group Normalization (CV/Small batches)

  - RMS Normalization (LLMs/Efficiency)

  - Spectral Normalization (GAN stability)

- Gradient clipping (Value & Norm)

- Loss landscape visualization & Flat vs. Sharp minima

###### Topic: Architectures

- CNNs: Convolutions, Pooling, Dilated/Atrous convs (cross-ref CV)

- RNNs, LSTM, GRU (Gating mechanisms: Input, Forget, Output)

- Seq2seq architectures & Encoder-Decoder bottleneck

- **Residual Connections & Skip-connections (Identity mapping)**

- **Attention Mechanisms:**

  - Scaled Dot-Product Attention

  - Multi-Head Attention (MHA)

  - Self-attention vs. Cross-attention

- GANs (Generator/Discriminator, Mode collapse, Wasserstein GAN)

- **Self-supervised Learning:**

  - Masked Autoencoders (MAE)

  - DINO (Self-distillation)

  - Contrastive learning (BYOL, SimSiam)

###### Topic: Practical Training & Scale

- GPU training & CUDA memory management

- Mixed precision training (FP16, BF16, GradScaler)

- Gradient accumulation & Large batch training

- Distributed training: Data Parallel (DP), Distributed Data Parallel (DDP)

- **Fully Sharded Data Parallel (FSDP) & Pipeline Parallelism**

- **Memory-efficient Attention (FlashAttention, XFormers)**

###### Topic: Model Adaptation & Compression

- Transfer learning & Fine-tuning (Full vs. Head-only)

- Feature extraction vs. Weight updating

- Knowledge Distillation (Teacher-Student framework)

- **Parameter-Efficient Fine-Tuning (PEFT):**

  - LoRA (Low-Rank Adaptation)

  - Adapters & Prefix Tuning

- **Model Compression:**

  - Quantization (Post-training vs. QAT, INT8/FP8/NF4)

  - Weight Pruning (Structured vs. Unstructured)

  - Low-rank decomposition

###### Topic: Meta-learning & Advanced Research

- Few-shot learning problem framing

- MAML (Model-Agnostic Meta-Learning)

- Prototypical Networks & Relation Networks

- Hypernetworks (Weights generating weights)

- **Neural Architecture Search (NAS) basics**

###### Topic: DL Frameworks & Tooling

- **PyTorch:** Tensors, Autograd, `nn.Module`, `DataLoader`, `torch.compile`

- **TensorFlow / Keras:** Functional API, `tf.data`, XLA compiler

- **JAX:** Functional transformations (`grad`, `jit`, `vmap`, `pmap`), Equinox/Flax

- **ONNX & TensorRT:** Model interoperability and deployment optimization

### SKILL: Model Serving & Optimization

`Tier: 2T` | `Roles: MLE, AIE` | **Max Level: 10** | **Prerequisites: MLOps Lv 5, Systems Fundamentals Lv 8, Deep Learning Lv 6**

###### Topic: Inference Engines

- Triton Inference Server architecture (Model repository, Scheduler, Ensembles)

- **vLLM (PagedAttention, Continuous Batching, Prefix Caching)**

- **TensorRT (Engine building, Layer fusion, Precision calibration)**

- **TGI (Text Generation Inference) architecture**

- **Serving Frameworks: BentoML, Ray Serve, Seldon Core**

###### Topic: Model Compilation & Graph Optimization

- ONNX and ONNX Runtime (Cross-platform execution)

- TorchScript (Tracing vs. Scripting) and JIT compilation

- **Operator Fusion & Constant Folding**

- **Kernel Auto-tuning (TVM, MLIR)**

- **Static vs. Dynamic Graph execution**

###### Topic: Quantization & Compression (Serving Focus)

- **Post-Training Quantization (PTQ): Symmetric vs. Asymmetric**

- **Quantization Aware Training (QAT) integration**

- **Weight formats: INT8, FP8, NF4 (NormalFloat), GGUF, EXL2**

- **Weight Pruning (Structured vs. Unstructured) & Sparsity**

- **Knowledge Distillation for production deployment**

###### Topic: LLM-Specific Efficiency Techniques

- **KV Cache Optimization (Management and Multi-Query/Grouped-Query Attention)**

- **Speculative Decoding (Draft models vs. Target models)**

- **FlashAttention & FlashAttention-2 integration**

- **Streaming LLM (Attention sinks for long context)**

- **Context Caching & State Management**

###### Topic: Distributed & High-Scale Inference

- **Model Parallelism for serving: Tensor Parallel (TP) vs. Pipeline Parallel (PP)**

- **Multi-GPU/Multi-Node inference scaling**

- **Load Balancing (Layer-7) and Request Queueing**

- **Autoscaling based on Latency (p99) vs. Throughput**

- **Cold-start mitigation for serverless GPU inference**

###### Topic: Hardware-Specific Runtimes

- **NVIDIA: TensorRT, CUDA Graph**

- **Intel: OpenVINO, OneDNN**

- **Apple: CoreML, MLX**

- **Mobile/Edge: TFLite, ONNX Mobile, ExecuTorch**

### SKILL: Streaming Architectures

`Tier: 2T` | `Roles: DE, MLE` | **Max Level: 10** | **Prerequisites: Data Engineering Lv 5, Systems Fundamentals Lv 7, Python Lv 6**

###### Topic: Event Streaming Foundations

- Apache Kafka architecture (Brokers, Controllers, Topics, Partitions)

- **Zookeeper vs. KRaft (Metadata management)**

- **Producer Internals (Acks, Retries, Idempotency, Compression)**

- **Consumer Internals (Consumer Groups, Rebalancing, Offset Management)**

- Exactly-once semantics (EOS) and Transactional API

- **Schema Registry (Avro, Protobuf, JSON Schema) & Compatibility rules**

###### Topic: Stream Processing Frameworks

- Apache Flink (DataStream API, Table API, Flink SQL)

- **State management (Keyed state, Operator state) & Checkpointing/Savepoints**

- **State Backends (HashMap vs. RocksDB)**

- Spark Structured Streaming (Micro-batching vs. Continuous processing)

- **Stateful operators and Aggregations**

- **Backpressure handling & Flow control**

###### Topic: Temporal Logic & Windowing

- **Event-time vs. Processing-time vs. Ingestion-time**

- **Watermarks (Generation, Lateness handling, and Slack)**

- **Windowing strategies (Tumbling, Sliding, Session, and Global windows)**

- **Join patterns (Stream-Stream, Stream-Static, Interval joins)**

###### Topic: Real-time Feature Engineering (MLE Core)

- **Online Feature Calculation (Windowed aggregations for RecSys/Fraud)**

- **Point-in-Time Joins (Avoiding data leakage in streaming pipelines)**

- **Streaming Inference (Embedding model serving in-stream)**

- **Feature TTL and Cache invalidation in streaming contexts**

###### Topic: Change Data Capture (CDC) & Integration

- **CDC patterns (Log-based vs. Query-based)**

- **Debezium & Kafka Connect (Source/Sink connectors)**

- **The Outbox Pattern for microservice state consistency**

- **Dead Letter Queues (DLQ) for error handling**

- Alternatives: Apache Pulsar (Tiered storage), RabbitMQ (Message queuing)

###### Topic: Operations & Reliability

- **Kafka Performance Tuning (Batch size, Linger.ms, Buffer memory)**

- **Partitioning strategies & Data Skew mitigation**

- **Monitoring (Consumer Lag, Throughput, Broker health)**

- **Disaster Recovery (MirrorMaker 2, Cluster linking)**

- **Infrastructure as Code for streaming (Terraform for Kafka/Flink)**

### SKILL: Reinforcement Learning

`Tier: 2T` | `Roles: MLE, AIE` | **Max Level: 10** | **Prerequisites: Stochastic Processes & Simulation Lv 6, Deep Learning Lv 7, Mathematical Optimization Lv 7**

###### Topic: RL Foundations

- Markov Decision Processes (MDPs): State (s), Action (a), Reward (r), Policy (π), and Value functions

- **Bellman Equations:** The fundamental recursive relationship for V(s) and Q(s,a)

    Vπ(s)=Eπ​[rt​+γVπ(st+1​)∣st​=s]

- Exploration vs. Exploitation tradeoff (ϵ-greedy, Upper Confidence Bound, Thompson Sampling)

- Model-based (learning dynamics) vs. Model-free (learning policies/values directly)

- **Discount factor (γ) and Credit Assignment Problem**

###### Topic: Classic RL Algorithms

- Q-Learning: Tabular mechanics, Q-table updates, and convergence proofs

- SARSA: On-policy temporal difference learning

- Deep Q-Networks (DQN):

  - **Experience Replay (breaking temporal correlation)**

  - **Target Networks (stabilizing moving targets)**

  - **Double DQN & Dueling DQN architectures**

- On-policy (SARSA, PPO) vs. Off-policy (Q-Learning, SAC, DQN)

- Importance sampling for off-policy corrections

###### Topic: Advanced RL & Actor-Critic

- Policy Gradient methods: REINFORCE and the Score Function Estimator

- **Actor-Critic Framework: Reducing variance in policy gradients**

- Proximal Policy Optimization (PPO): Clipped objective functions for stable updates

- Soft Actor-Critic (SAC): Maximum entropy RL for robust exploration

- **Direct Preference Optimization (DPO): Training without an explicit reward model**

- Model-based RL: World Models, Dyna-Q, and Monte Carlo Tree Search (MCTS)

###### Topic: Multi-agent RL (MARL)

- Cooperative vs. Competitive settings (Zero-sum games)

- **Centralized Training, Decentralized Execution (CTDE)**

- Nash Equilibrium and Game Theory in MARL

- **Independent Q-Learning vs. QMIX / VDN for value decomposition**

- Emergent communication and coordination protocols

###### Topic: Safe & Constrained RL

- Constrained MDPs (CMDPs): Optimizing rewards within safety budgets

- **Constrained Policy Optimization (CPO): Trust region methods for safety**

- Lagrangian methods for penalty-based constraint satisfaction

- Risk-sensitive RL (CVaR objectives, Distributional RL)

- **Safety in real-world deployment: Conservative Q-Learning (CQL)**

###### Topic: RL Applications & Engineering

- **RLHF (Reinforcement Learning from Human Feedback) for LLM alignment**

- Reward model training and Reward hacking mitigation

- RL for Recommender Systems: Optimizing for long-term user retention

- **Sim-to-Real Transfer: Domain randomization and system identification**

- Tooling: Gymnasium (OpenAI Gym), Ray RLlib, Stable Baselines3, CleanRL

### SKILL: Bayesian ML

`Tier: 2T` | `Roles: DS, MLE` | **Max Level: 10** | **Prerequisites: Statistics Lv 8, Calculus Lv 7, Linear Algebra Lv 7, ML Classical Lv 6**

###### Topic: Bayesian Foundations

- Prior, likelihood, and posterior distributions

- **Bayes' Theorem for parameter estimation:**

    P(θ∣D)=P(D)P(D∣θ)P(θ)​

- Conjugate priors & closed-form posteriors (Beta-Binomial, Normal-Normal)

- Bayesian vs. Frequentist decision theory (Loss functions, Risk)

- **Predictive distributions & Model evidence (Marginal Likelihood)**

- **Posterior Predictive Checks (PPC)**

###### Topic: Approximate Inference

- MCMC (Metropolis-Hastings, Gibbs Sampling)

- **Hamiltonian Monte Carlo (HMC) & NUTS (No-U-Turn Sampler)**

- **Variational Inference (VI):**

  - The ELBO (Evidence Lower Bound) maximization

  - Mean-field approximation

  - Automatic Differentiation Variational Inference (ADVI)

- Expectation Propagation & Laplace approximation

- **Integrated Nested Laplace Approximations (INLA)**

###### Topic: Probabilistic Graphical Models (PGMs)

- Directed (Bayesian Networks) vs. Undirected (Markov Random Fields) models

- Factor graphs & Factor graph inference

- **Plate notation for hierarchical and repetitive models**

- Belief propagation (Sum-product, Max-product/Viterbi)

- Conditional Random Fields (CRF) for structured prediction

- **D-separation & Independence properties**

###### Topic: Probabilistic Models

- Bayesian Linear & Logistic Regression (Uncertainty in weights)

- **Gaussian Processes (GP):** Kernels (RBF, Matérn, Periodic), GPR, and GPC

- **Bayesian Neural Networks (BNN):** Weight distributions, MC Dropout as approximate Bayesian inference

- Latent Variable Models: VAEs from a Bayesian lens, LDA (Latent Dirichlet Allocation)

- **Hierarchical Linear Models (Mixed Effects)**

###### Topic: Bayesian Tooling & Applications

- Probabilistic Programming Languages (PPLs): **PyMC, Stan, Pyro, NumPyro, Bean Machine**

- Uncertainty quantification in production (Aleatoric vs. Epistemic uncertainty)

- **Bayesian Optimization:** Acquisition functions (Expected Improvement, Upper Confidence Bound) using **BoTorch/GPyOpt**

- Bayesian A/B testing: Probability of beating control, Value at Risk

- **Causal Inference via Bayesian Structural Time Series (BSTS)**

### SKILL: Explainable AI (XAI)

`Tier: 2T` | `Roles: MLE, DS, AIE` | **Max Level: 10** | **Prerequisites: ML Classical Lv 5, Deep Learning Lv 5, Statistics Lv 6**

###### Topic: Interpretability Foundations

- **Interpretable vs. Explainable:** Intrinsic transparency (Ante-hoc) vs. Post-hoc approximations.

- **Global vs. Local Explanations:** Understanding the whole model vs. a single prediction.

- **Model-agnostic vs. Model-specific methods.**

- **The "Accuracy-Interpretability Trade-off":** Balancing predictive power with human-readability.

- **Evaluation Criteria:** Faithfulness (truth to the model), Stability (robustness to noise), and Comprehensibility (clarity for humans).

###### Topic: Feature Attribution Methods

- **SHAP (Shapley Additive Explanations):** Grounded in game theory.

  - **Shapley Value Formula:**

        ϕi​(v)=S⊆N∖{i}∑​n!∣S∣!(n−∣S∣−1)!​[v(S∪{i})−v(S)]

  - TreeSHAP, KernelSHAP, DeepSHAP, and SHAP for NLP/CV.

- **LIME (Local Interpretable Model-agnostic Explanations):** Local surrogate models, stability & fidelity limitations.

- **Integrated Gradients:** Axiomatic attribution (Completeness, Sensitivity, Implementation Invariance).

- **Permutation Feature Importance:** Impact of feature shuffling on model error.

- **Saliency Maps & Grad-CAM:** Visualizing importance in Computer Vision.

###### Topic: Model-specific Interpretability

- **Linear Models:** Coefficient magnitude, p-values, and confidence intervals.

- **Decision Trees:** Rule extraction, path visualization, and surrogate trees.

- **Attention Visualizations:** Heatmaps (and the "Attention is not Explanation" debate).

- **Concept Activation Vectors (TCAV):** Testing if a model uses human-friendly concepts (e.g., "stripes" for a zebra).

- **GNNExplainer:** Explaining predictions in Graph Neural Networks.

###### Topic: Example-based & Counterfactual Explanations

- **Counterfactual Explanations:** "What is the minimum change to the input to change the output?" (e.g., for loan denials).

- **Contrastive Explanations:** Highlighting why the model chose Class A instead of Class B.

- **Prototypes & Criticisms:** Finding representative examples and outliers in the data.

- **Anchors:** High-precision local rules that "anchor" a prediction.

###### Topic: Applied XAI & Governance

- **Regulatory Context:** The EU AI Act, "Right to Explanation," and Model Cards for transparency.

- **Fairness & Bias Auditing:** Identifying disparate impact through attribution (e.g., detecting if a model is using "redlining" proxies).

- **XAI in Production:** Building Explanation APIs and managing the latency overhead of SHAP/LIME.

- **Human-in-the-loop (HITL):** Using explanations to build trust and allow domain experts to correct model reasoning.

### Tier 2.5

### SKILL: AWS Machine Learning Engineer – Associate (Meta-node)

`Tier: 2.5T` | `Roles: MLE, DS, DE` | **Max Level: 10** | **Prerequisites: MLOps Lv 5, Data Engineering Lv 5, Cloud Fundamentals Lv 4**

###### Topic: Amazon SageMaker Ecosystem (The Core)

- **SageMaker Studio & Notebooks:** Environment management, lifecycle configurations, and kernel selection.

- **SageMaker Training Jobs:** Distributed training, managed spot instances for cost saving, and hyperparameter tuning (HPO).

- **SageMaker Pipelines:** Building, automating, and managing end-to-end ML workflows.

- **SageMaker Feature Store:** Online vs. Offline stores, ingestion, and feature discovery.

- **SageMaker Inference:** Real-time endpoints, asynchronous inference, serverless inference, and multi-model endpoints (MME).

- **SageMaker Model Monitor:** Detecting data drift, concept drift, and bias in production.

- **SageMaker Clarify:** Model explainability and bias detection during training and inference.

- **SageMaker Edge Manager & Neo:** Model compilation and deployment to edge devices.

###### Topic: Managed AI Services (High-Level API)

- **Computer Vision:** Amazon Rekognition (Image/Video analysis, face detection, PPE detection).

- **Natural Language Processing:** Amazon Comprehend (Sentiment, entity extraction, PII redaction).

- **Document Processing:** Amazon Textract (OCR, form/table extraction, document routing).

- **Speech & Audio:** Amazon Transcribe (STT) and Amazon Polly (TTS).

- **Conversational AI:** Amazon Lex (NLU, chatbots, Lambda integration).

- **Translation & Personalization:** Amazon Translate and Amazon Personalize (RecSys as a service).

###### Topic: Data Engineering & Analytics for ML

- **Data Ingestion:** Amazon Kinesis (Data Streams, Firehose, Video Streams) for real-time data.

- **Data Transformation:** AWS Glue (ETL, Crawlers, Data Catalog, Interactive Sessions) and AWS Glue DataBrew.

- **Analytical Queries:** Amazon Athena (Serverless SQL on S3) and Amazon Redshift (Data warehousing for ML).

- **Storage Layers:** Amazon S3 (Buckets, Partitioning, Lifecycle policies, Intelligent-Tiering).

###### Topic: Infrastructure, Security & Governance

- **Compute:** EC2 (P/G instance types for GPUs), ECS/EKS for containerized ML, and AWS Lambda for serverless inference logic.

- **Security & Compliance:** IAM (Roles, Policies, Service-Linked Roles), VPC (Private links, subnets, security groups), and KMS (Encryption at rest/transit).

- **Storage Performance:** Amazon EFS vs. FSx for Lustre (High-performance data loading for SageMaker).

- **Cost Governance:** AWS Budgets, Cost Explorer, and SageMaker Savings Plans.

###### Topic: Architecture & Exam Strategy

- **The AWS Well-Architected Framework:** Applying the "Machine Learning Lens."

- **Service Selection Logic:** Choosing between Managed Services vs. Custom SageMaker Models.

- **Troubleshooting:** Debugging SageMaker training failures and monitoring CloudWatch logs.

- **Exam-Specific Patterns:** Cost optimization (Spot vs. On-demand) and High Availability (Multi-AZ deployments).

### SKILL: System Design for ML

`Tier: 2.5T` | `Roles: MLE, DE, AIE` | **Max Level: 10** | **Prerequisites: MLOps Lv 5, Software Engineering for ML Lv 7, NoSQL Databases Lv 4**

###### Topic: Scalable Data Architecture

- **Load Balancing & Sharding:** Distributing traffic and data across clusters to prevent hotspots.

- **CAP Theorem:** Navigating the trade-offs between Consistency, Availability, and Partition Tolerance in distributed ML databases.

- **Partitioning Strategies:** Horizontal vs. Vertical scaling; Range-based vs. Hash-based partitioning for massive ML datasets.

- **Consistency Models:** Strong vs. Eventual consistency in the context of feature updates and model metadata.

###### Topic: ML System Architectures

- **Serving Patterns:** Real-time (Request/Response) vs. Batch (Asynchronous) serving.

- **Queue-based Inference:** Using message brokers (Kafka/RabbitMQ) for decoupled, resilient prediction pipelines.

- **Two-Tower Architectures:** Separating User and Item "towers" for efficient retrieval in Large-scale RecSys.

- **Feature Pipeline Design:** Maintaining symmetry between **Online (Low-latency)** and **Offline (High-throughput)** feature generation.

###### Topic: Data Systems Design

- **OLTP vs. OLAP:** Choosing between transactional databases for user state and analytical warehouses (Snowflake/BigQuery) for model training.

- **Event Sourcing & CQRS:** Decoupling read and write operations to handle complex state changes in ML applications.

- **Architectural Paradigms:** * **Lambda Architecture:** Combining batch and stream processing for balanced speed and accuracy.

  - **Kappa Architecture:** Stream-only processing for simplified real-time pipelines.

- **Data Mesh Principles:** Domain-oriented decentralization and "Data-as-a-Product" for cross-functional ML teams.

###### Topic: ML Platform Architecture

- **Self-Serve Platforms:** Designing internal interfaces for experiment tracking, feature stores, and model registries.

- **Platform Abstraction:** Using SDKs to hide infrastructure complexity (Kubernetes/Ray) from Data Scientists.

- **Multi-Tenancy:** Ensuring resource isolation, security, and quota management across different projects.

- **Compute Scheduling:** Orchestrating GPU/CPU resources via K8s, Slurm, or Ray Clusters.

- **Cost Attribution:** Implementing "showback" or "chargeback" mechanisms to track ML infrastructure ROI.

###### Topic: ML at Scale

- **Large-Scale Training:** Implementing **Data Parallelism, Model Parallelism, and Pipeline Parallelism** for billion-parameter models.

- **High-Throughput Serving:** Autoscaling groups, Load balancer health checks, and Latency budgets.

- **Multi-Model Serving:** Efficiently hosting thousands of per-user or per-organization models.

- **A/B Testing Infrastructure:** Feature flagging, traffic splitting, and automated metric collection at scale.

###### Topic: Reliability & Operations

- **SLAs, SLOs, and SLIs:** Defining and monitoring "Model Health" as a system reliability metric.

- **Resiliency Patterns:** Implementing **Circuit Breakers** to prevent cascading failures and **Fallbacks** (e.g., serving a heuristic or cached prediction).

- **Disaster Recovery:** Multi-region failover strategies for critical ML endpoints.

- **Cost Optimization:** Spot instances, Graviton/ARM inference, and automated resource cleanup patterns.

### SKILL: MLOps Observability

`Tier: 2.5T` | `Roles: MLE, DS` | **Max Level: 10** | **Prerequisites: MLOps Lv 6, Statistics Lv 7, Systems Fundamentals Lv 5**

###### Topic: Drift & Degradation Detection

- **Data Drift (Covariate Shift):** Detecting changes in the distribution of input features P(X).

- **Concept Drift:** Detecting changes in the relationship between inputs and the target P(Y∣X).

- **Statistical Distance Metrics:** * **Kullback-Leibler (KL) Divergence:**

    DKL​(P∣∣Q)=x∈X∑​P(x)log(Q(x)P(x)​)

  - **Population Stability Index (PSI):** Quantifying how much a variable has shifted over time.

  - **Wasserstein Distance:** "Earth Mover's Distance" for continuous distributions.

  - **Jensen-Shannon Divergence:** A symmetric and smoothed version of KL.

- **Adversarial Validation:** Training a "domain classifier" to see if it can distinguish between training and production data (a high AUC indicates drift).

- **Tooling:** Evidently AI, NannyML, Deepchecks, and Great Expectations for schema validation.

###### Topic: Production System Telemetry

- **Gold Signals for ML:** * **Latency:** p50, p95, and p99 response times for inference.

  - **Throughput:** Requests per second (RPS) and concurrency limits.

  - **Error Rates:** Tracking 429 (Rate Limit), 503 (Service Unavailable), and model-specific exceptions.

- **Inference Resource Monitoring:** GPU/CPU utilization, VRAM fragmentation, and memory leaks in long-running serving containers.

- **Instrumentation:** Using Prometheus for metrics and Grafana for dashboarding model health.

###### Topic: LLM & Generative AI Observability

- **Distributed Tracing:** Tracking complex RAG chains using OpenTelemetry, Arize Phoenix, or LangSmith.

- **RAG-Specific Metrics:** * **Faithfulness:** Does the answer match the retrieved context?

  - **Relevancy:** Does the retrieved context actually help answer the query?

- **Cost & Token Tracking:** Real-time monitoring of prompt/completion token usage and cost per 1k requests.

- **Hallucination Monitoring:** Production-time detection of factual inconsistencies.

###### Topic: Advanced Evaluation Strategies

- **Shadow Deployment (Dark Launch):** Running a new model in parallel with the production model, sending it real traffic but not using its predictions.

- **Champion-Challenger (A/B Testing):** Routing percentages of traffic to different model versions to compare business KPIs.

- **Canary Releases:** Gradual rollout of a model to a small subset of users to minimize blast radius.

- **Slice-based Monitoring:** Monitoring performance on specific sub-segments (e.g., "users on Android" or "users in Hamburg") to detect localized failures.

###### Topic: Closing the Feedback Loop

- **Delayed Label Handling:** Strategies for evaluating models when the "ground truth" only arrives days or weeks later (e.g., credit default or purchase conversion).

- **Automated Retraining Triggers:** Setting thresholds on drift metrics to kick off a CI/CD/CT pipeline.

- **Root Cause Analysis (RCA):** Using SHAP or LIME to explain _why_ a specific model version drifted or failed on a specific slice.

### SKILL: Applied Fine-Tuning & Advanced Prompting

`Tier: 2T` | `Roles: AIE, MLE` | **Max Level: 10** | **Prerequisites: Deep Learning Lv 6, NLP Lv 6, Python Lv 8**

---

###### Topic: Parameter-Efficient Fine-Tuning (PEFT)

- **LoRA & QLoRA Mathematics:** Low-rank decomposition of weight updates.

- ΔW=BA where B∈Rd×r,A∈Rr×k and r≪min(d,k)

- **Quantization (NF4):** Using 4-bit NormalFloat for high-fidelity weight compression without losing significant perplexity.

- **ReFT (Representation Fine-Tuning):** Emerging 2026 SOTA technique—editing hidden representations instead of weights, achieving LoRA-level performance with ∼3% of the parameters.

- **Adapters & Prompt Tuning:** Bottleneck layers and soft-prompt optimization.

- **Quantization-Aware Training (QAT):** Bridging the gap between 16-bit training and 4-bit deployment.

###### Topic: Dataset Engineering & Lifecycle

- **Chat Templates:** Implementing standard formats like **ShareGPT**, **Alpaca**, and **ChatML** to maintain conversational structure.

- **Data Synthesis & Quality:** Using "Self-Instruct" patterns to generate synthetic high-quality training pairs.

- **Sample Packing:** Efficiently concatenating short sequences into fixed-length blocks to maximize GPU throughput.

- **Data Cleaning:** Detecting and removing toxic, repetitive, or low-quality logic traces in SFT (Supervised Fine-Tuning) sets.

###### Topic: Fine-Tuning Frameworks (2026 SOTA)

- **Unsloth:** Custom Triton kernels for single-GPU training; 2-5x faster than Hugging Face's `SFTTrainer` with 80% less memory usage.

- **Axolotl:** The go-to for multi-GPU distributed training using **FSDP2** (Fully Sharded Data Parallel) and deep YAML-based configuration.

- **TorchTune:** PyTorch-native, abstraction-free fine-tuning for maximum hackability and low-level control.

- **LLaMA-Factory:** High-level GUI and CLI for rapid experimentation with 100+ open-source models.

###### Topic: Programmatic & Agentic Prompting

- **DSPy (Declarative Self-improving Python):** Shifting from "prompt engineering" to "LM programming."

- - **Signatures:** Declarative specifications of input/output behavior (e.g., `question -> answer`).

    - **Modules:** `ChainOfThought`, `ReAct`, `ProgramOfThought`, and `MultiChainComparison`.

    - **Optimizers (Teleprompters):** `MIPROv2`, `BootstrapFewShotWithRandomSearch`, and `COPRO` for automated prompt refinement based on a metric.

###### Topic: Advanced Reasoning Patterns

- **Chain of Thought (CoT):** Step-by-step reasoning traces.

- **Tree of Thoughts (ToT):** Exploring multiple reasoning branches with look-ahead and backtracking.

- **ReAct (Reason + Act):** Interleaving reasoning steps with tool use (APIs, Python REPL, Search).

- **GRPO (Group Relative Policy Optimization):** Training reasoning models without a separate value-function model (as seen in DeepSeek-R1 style training).

###### Topic: RAG Engineering & Optimization

- **Advanced Chunking:** * **Semantic Chunking:** Splitting based on embedding similarity rather than character count.

  - **Recursive Character Splitting:** Maintaining structural context (paragraphs > sentences).

- **Reranking:** Using **Cross-Encoders** or specialized reranker models (BGE-Reranker, Cohere) to solve the "lost in the middle" problem.

- **Hybrid Search:** Combining **BM25 (sparse)** for keyword precision with **Dense Vector (semantic)** search via Reciprocal Rank Fusion (RRF).

- **Query Transformation:** Multi-query expansion, HyDE (Hypothetical Document Embeddings), and Query decomposition for multi-hop questions.

### SKILL: Generative AI & Large Language Models

`Tier: 2.5T` | `Roles: MLE, AIE` | **Max Level: 10** | **Prerequisites: Deep Learning Lv 7, NLP Lv 8, MLOps Lv 5, Systems Fundamentals Lv 6**

---

###### Topic: Transformer Architecture & Attention Mechanisms

- **Tokenization:** BPE (Byte Pair Encoding), SentencePiece, and Tiktoken (Byte-level BPE).

- **Positional Encoding:** Absolute vs. Relative; **RoPE (Rotary Positional Embeddings)** math, ALiBi (Attention with Linear Biases), and YaRN (Yet another RoPE extensioN) for context scaling.

- **Multi-Head Attention (MHA)** vs. **Grouped-Query Attention (GQA)** vs. **Multi-Query Attention (MQA)** for inference efficiency.

- **Encoder-Decoder (T5/BART)** vs. **Encoder-only (BERT)** vs. **Decoder-only (GPT/LLaMA)** trade-offs.

- **FlashAttention & FlashAttention-2/3 Internals:** Tiling, recomputation, and IO-awareness for linear memory growth in attention.

- **Efficient Variants:** Longformer (Sliding window), BigBird (Global + Random + Local), and Linear Attention.

###### Topic: Foundation Models & Scaling Laws

- **Pre-training Paradigms:** Causal Language Modeling (CLM), Masked Language Modeling (MLM), and Denoising.

- **Scaling Laws:** Chinchilla optimality (Token count vs. Parameter count); Emergent abilities (In-context learning, step-by-step reasoning).

- **Dataset Engineering:** Data curation pipelines, quality filtering (C4, Pile, FineWeb), and synthetic data generation (Self-Instruct).

- **Multi-modal Foundations:** CLIP (Contrastive Language-Image Pre-training), Flamingo, Gemini, and GPT-4o architecture (Early vs. Late fusion).

- **Mixture of Experts (MoE):** Sparse activation, router logic, and load balancing (DeepSeek-V3, Mixtral).

###### Topic: Alignment & Fine-tuning (SFT to RLHF)

- **Supervised Fine-Tuning (SFT):** Instruction tuning and dataset formats (Alpaca, ShareGPT).

- **Reinforcement Learning from Human Feedback (RLHF):** * **PPO (Proximal Policy Optimization):** Reward modeling and policy updates.

  - **DPO (Direct Preference Optimization):** Removing the reward model bottleneck.

  - **KTO (Kahneman-Tversky Optimization) & ORPO:** Alignment without separate reference models.

- **Constitutional AI:** RLAIF (Reinforcement Learning from AI Feedback) and self-critique loops.

- **PEFT (Parameter-Efficient Fine-Tuning):** LoRA, QLoRA, DoRA, and Prompt Tuning.

###### Topic: Advanced Prompting & Reasoning

- **Reasoning Patterns:** Chain-of-Thought (CoT), Tree-of-Thoughts (ToT), and Graph-of-Thoughts (GoT).

- **In-Context Learning (ICL):** Zero-shot, Few-shot, and Analogical prompting.

- **Programmatic Prompting:** **DSPy** for declarative optimization of prompt pipelines.

- **Prompt Engineering Tools:** LangSmith versioning, prompt injection mitigation, and templating.

###### Topic: RAG & Vector Systems

- **Chunking & Indexing:** Semantic chunking, HNSW (Hierarchical Navigable Small World), and IVF (Inverted File Index) trade-offs.

- **Retrieval Strategies:** Dense (Embeddings) vs. Sparse (BM25) vs. Hybrid search (Reciprocal Rank Fusion).

- **Reranking:** Cross-encoders and Cohere Rerank for precision.

- **Advanced RAG:** * **GraphRAG:** Combining Knowledge Graphs with vector search for global context.

  - **Agentic RAG:** Iterative loops for multi-hop retrieval and self-correction.

- **Evaluation:** RAGAS (Faithfulness, Answer Relevance, Context Precision).

###### Topic: AI Agents & MCP

- **Agentic Loops:** ReAct (Reason + Act), Planning (LLM-Compiler), and Tool Use.

- **Memory Architectures:** Short-term (In-context), Long-term (Vector), and Procedural (Code/Rules).

- **Model Context Protocol (MCP):** * **Architecture:** Host, Client, and Server interaction over `stdio` or `SSE`.

  - **Primitives:** Resources (data), Tools (actions), and Prompts (templates).

  - **Security:** Permission scoping and prompt injection defense in tool execution.

- **Multi-Agent Systems:** Orchestrator-subagent, Peer-to-peer debate, and AutoGen/CrewAI frameworks.

###### Topic: Evaluation, Safety & Red-Teaming

- **Benchmarks:** MMLU (Knowledge), GSM8K (Math), HumanEval (Code), and Chatbot Arena (ELO).

- **LLM-as-a-Judge:** Using GPT-4/Claude to grade model outputs with rubrics.

- **Red-Teaming:** Jailbreaking taxonomy, adversarial prompt generation, and indirect prompt injection.

- **Safety Frameworks:** Guardrails (LlamaGuard, NeMo Guardrails) and Constitutional AI safety layers.

###### Topic: Inference Optimization & Serving

- **KV Cache Mechanics:** Memory overhead of long sequences.

- **PagedAttention:** Dynamic memory allocation (vLLM) to reduce fragmentation.

- **Speculative Decoding:** Using a small draft model to accelerate a larger target model.

- **Quantization:** GPTQ, AWQ, GGUF, and 4-bit/8-bit precision trade-offs.

- **Serving Stacks:** vLLM, TGI (Text Generation Inference), and TensorRT-LLM.

  ###### Topic: LLMs

- GPT, Claude, LLaMA, Mistral architectures

- Open-source LLMs (LLaMA, Mistral, Qwen, Phi)

- Fine-tuning objectives

- RLHF (PPO, DPO)

- LLM evaluation (BLEU, ROUGE, Perplexity, HELM, MMLU, TruthfulQA)

- Mixture of Experts (MoE)

### Tier 3

#### SKILL: Hardware-Software Co-Design & Energy Efficiency

`Tier: 3T` | `Roles: MLE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 9, Distributed ML Systems Lv 7**

###### Topic: Microarchitecture Optimization

- GPU Architecture deep-dive: H100/A100 (Tensor Cores, L2 Cache, HBM3)
- TPU vs. GPU: Tiling strategies and XLA compilation
- Custom Operators: Writing OpenAI Triton or CUDA kernels for specific memory patterns
- FlashAttention and Memory-efficient attention mechanisms

###### Topic: Green AI & Sustainability

- Carbon tracking and energy consumption profiling (CodeCarbon, Carbontracker)
- Hardware-aware NAS (Neural Architecture Search) for energy efficiency
- Carbon-aware scheduling: Shifting training to low-carbon intensity periods
- Quantization-Aware Training (QAT) for low-power edge deployment

---

#### SKILL: ML Security, Privacy & Safety

`Tier: 3T` | `Roles: MLE, AIE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 8, Advanced Deep Learning Frameworks Lv 7, Statistics Lv 7**

###### Topic: Adversarial Machine Learning

- Adversarial Attacks (FGSM, PGD, Carlini-Wagner)
- Defense Mechanisms: Adversarial Training and Defensive Distillation
- Model Inversion and Membership Inference attacks
- Poisoning attacks in Federated Learning environments

###### Topic: Privacy-Preserving ML (PPML)

- Differential Privacy (DP-SGD, Moments Accountant)
- Federated Learning (FedAvg, FedProx) and Secure Aggregation
- Homomorphic Encryption for encrypted inference
- Trusted Execution Environments (TEEs) for model weights

###### Topic: AI Safety & Alignment

- Red Teaming for LLMs: Jailbreaking and Prompt Injection
- Hallucination detection and mitigation strategies
- RLHF (Reinforcement Learning from Human Feedback) implementation
- Evaluation benchmarks for bias, toxicity, and truthfulness

#### SKILL: Distributed ML Systems

`Tier: 3T` | `Roles: MLE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 8, Python Lv 8, Data Engineering Lv 7**

###### Topic: Large-Scale Training

- Data Parallelism (DP) vs. Distributed Data Parallelism (DDP)
- Model Parallelism & Pipeline Parallelism (GPipe, PipeDream)
- Tensor Parallelism (Megatron-LM patterns)
- ZeRO Redundancy Optimizer (DeepSpeed stages 1, 2, 3)
- Fully Sharded Data Parallel (FSDP) internals

###### Topic: Distributed Compute Frameworks

- Spark MLlib & Horovod on Spark
- Ray Core (Actors, Tasks, Objects)
- Ray Train & Ray Data for high-throughput ingestion
- Dask for distributed dataframe operations
- Parameter Servers vs. All-Reduce architectures

###### Topic: Efficiency & Optimization

- Mixed Precision Training (FP16, BF16, FP8)
- Gradient Accumulation and Checkpointing
- Communication collectives (NCCL, Gloo, MPI)
- Bandwidth-aware scheduling and Topology-aware training

#### SKILL: Advanced Deep Learning Frameworks (PyTorch Core)

`Tier: 3T` | `Roles: MLE, AIE` | **Max Level: 10** | **Prerequisites: Mathematical Optimization Lv 7, Systems Fundamentals Lv 7, Python Lv 9**

###### Topic: Framework Internals

- PyTorch Dispatcher & ATen library
- Autograd engine: Custom Function implementation
- TorchScript: JIT compilation, Scripting vs. Tracing
- TorchDynamo & TorchInductor (PyTorch 2.x Compiler stack)
- Triton integration for custom kernel development

###### Topic: Performance Engineering

- Profiling with PyTorch Profiler & Kineto
- Identifying CPU/GPU bottlenecks and operator overhead
- Custom C++ Extensions and CUDA kernels
- Memory management: Caching Allocator internals and fragmentation
- Multi-GPU communication tuning

#### SKILL: Real-time ML & Streaming Architecture

`Tier: 3T` | `Roles: MLE, DE` | **Max Level: 10** | **Prerequisites: NoSQL Databases Lv 7, Data Engineering Lv 8, Systems Fundamentals Lv 8**

###### Topic: Event-Driven ML

- Kafka for high-throughput model feature ingestion
- Schema Registry management for ML features (Protobuf/Avro)
- Stateful Stream Processing with Apache Flink
- Watermarking and handling out-of-order events in ML pipelines
- Lambda vs. Kappa architecture for feature stores

###### Topic: Low-Latency Serving

- Online Feature Stores (Redis, DynamoDB, Tecton)
- Real-time feature engineering (windowing, rolling aggregates)
- Model serving with C++ runtimes (NVIDIA Triton, TorchServe)
- A/B testing and Canary deployments in streaming environments
- Dynamic routing and multi-armed bandit serving

#### SKILL: MLOps & Infrastructure at Scale

`Tier: 3T` | `Roles: MLE, DE` | **Max Level: 10** | **Prerequisites: Systems Fundamentals Lv 9, Data Engineering Lv 7**

###### Topic: Orchestration & Containers

- Kubernetes for ML (K8s Operators, CRDs)
- Kubeflow Pipelines & Training Operators
- Volcano and Argo Workflows for batch scheduling
- Multi-tenant GPU sharing and slicing (MIG, Time-slicing)
- Node affinity and Taints/Tolerations for heterogeneous hardware

###### Topic: Observability & Reliability

- Monitoring ML Drift (Data/Concept drift) in high-traffic systems
- Prometheus & Grafana for GPU and Model latency metrics
- Distributed Tracing for ML microservices (OpenTelemetry)
- Automated rollback and automated retraining triggers
- Service Level Objectives (SLOs) for ML inference

---

### Tier 4

#### SKILL: ML Research Engineering (Advanced)

`Tier: 4T` | `Roles: MLE` | **Max Level: 10** | **Prerequisites: ML Research Engineering Lv 8, Calculus Lv 10, Statistics Lv 10**

###### Topic: Numerical Stability & Theoretical Limits

- Jacobian/Hessian sensitivity analysis for vanishing/exploding gradients
- Theoretical limits of quantization and compression (Information Theory)
- Formal verification of Neural Networks
- Scaling Laws: Predicting model performance based on compute/data/parameter scaling

###### Topic: Frontier Architectures

- State-space models (S4, Mamba) vs. Transformers
- Neural ODEs and Continuous-depth models
- Diffusion internals: Forward/Reverse process and Score-based modeling
- Multi-modal fusion strategies (Late vs. Early vs. Mid-fusion)

#### SKILL: Advanced ML Product Strategy & Influence

`Tier: 4T` | `Roles: MLE` | **Max Level: 5** | **Prerequisites: ML System Architecture & Strategy Lv 4, Technical Communication Lv 5**

###### Topic: Product-ML Co-design

- Defining ML-specific UX constraints (Latency budgets vs. Model accuracy)
- Strategy for "Human-in-the-loop" system integration
- Feedback loops: Designing product telemetry for continuous model improvement
- Managing data flywheels and cold-start product strategies

###### Topic: Organizational Leadership & Influence

- Managing Up: Communicating ML uncertainty and probabilistic outcomes to non-technical VPs
- Cross-functional Influence: Aligning Product, Engineering, and Research roadmaps
- Building a High-Performance ML Culture: Balancing scientific rigor with product velocity
- Incident Command for Tier-0 ML outages (Global-scale model failures)

#### SKILL: ML Research Engineering & Scientific Rigor

`Tier: 4T` | `Roles: MLE` | **Max Level: 10** | **Prerequisites: Calculus Lv 10, Statistics Lv 10, Advanced Deep Learning Frameworks Lv 8**

###### Topic: SOTA Paper Implementation

- Reproducing results from top-tier conferences (NeurIPS, ICML, ICLR)
- Translating mathematical notation to optimized code
- Handling numerical stability in large-scale transformer architectures
- Implementing custom loss functions and activation layers based on theoretical research
- Ablation study design and rigorous error analysis

###### Topic: Architecture Innovation

- Designing custom Multi-modal architectures
- Cross-attention optimization and efficient Transformer variants
- Neural Architecture Search (NAS) and Automated Machine Learning (AutoML)
- Graph Neural Networks (GNNs) for non-euclidean data
- Diffusion and Generative AI internals

#### SKILL: ML System Architecture & Strategy

`Tier: 4T` | `Roles: MLE` | **Max Level: 5** | **Prerequisites: Distributed ML Systems Lv 9, MLOps & Infrastructure Lv 9, Technical Communication Lv 5**

###### Topic: System Design & Governance

- End-to-end ML System Design for Global-scale applications
- Build vs. Buy strategy for ML platforms
- Governance: ML Ethics, Bias detection, and Regulatory compliance (EU AI Act, etc.)
- Cost Optimization: Managing multi-million dollar cloud GPU budgets
- Technical Roadmap development for ML organizations

###### Topic: Leadership & Cross-functional Strategy

- Mentoring Staff and Senior MLEs
- Driving ML culture: Scientific rigor vs. Engineering velocity
- Aligning ML research with business ROI and product goals
- Leading incident post-mortems for complex ML system failures
- Defining organizational standards for ML development and deployment

#### SKILL: ML Systems

`Tier: 3T` | `Roles: MLE, AIE`

###### Topic: Production ML Systems at Scale

- Serving infrastructure design (multi-region, multi-model)
- Feature store design at scale
- Real-time + batch hybrid architectures
- ML platform design (internal tooling)

###### Topic: Reliability Engineering

- SLO budget management
- Chaos engineering for ML systems
- Incident response & post-mortems for ML

#### SKILL: World Models

`Tier: 3T` | `Roles: MLE`

###### Topic: Model-based RL World Models

- Dreamer / DreamerV3 (RSSM mechanics)
- MuZero (learned model + MCTS planning)
- TD-MPC2
- Imagination-based rollouts
- Dyna architecture
- World model fidelity metrics
- Compounding prediction error analysis

###### Topic: Generative World Models

- Video generation as world simulation (Sora, Genie)
- JEPA (Joint Embedding Predictive Architecture — LeCun)
- Predictive coding vs generative modeling
- V-JEPA, I-JEPA implementations
- Interactive world models for games & robotics
- World models for autonomous driving

#### SKILL: Distributed Systems for ML

`Tier: 3T` | `Roles: MLE`

###### Topic: Distributed Training

- Multi-node training (parameter servers, all-reduce)
- FSDP & DeepSpeed ZeRO stages (1, 2, 3)
- Megatron-LM tensor & pipeline parallelism
- Gradient checkpointing & memory optimization

###### Topic: Fault Tolerance & Monitoring

- Checkpoint strategies (async, sync, elastic)
- Elastic training (fault-tolerant restarts)
- Monitoring distributed jobs

#### SKILL: Foundation Models (Research Depth)

`Tier: 3T` | `Roles: MLE, AIE`

###### Topic: Pretraining at Scale

- Infrastructure (DeepSpeed, FSDP, Megatron-LM)
- Data pipeline at billion-token scale
- Curriculum learning & data mixing
- Checkpointing & fault tolerance

###### Topic: Fine-tuning (Research Depth)

- LoRA, QLoRA, PEFT at depth
- Full fine-tuning vs PEFT trade-offs
- Instruction tuning methodology
- Fine-tuning infrastructure (compute planning, data pipelines for SFT)

###### Topic: RLHF & Alignment

- PPO for LLMs (reward model + policy training loop)
- DPO (direct preference optimization mechanics)
- Constitutional AI & RLAIF
- Red-teaming & safety evaluation at research depth

###### Topic: Quantization (Research Depth)

- GPTQ (post-training quantization)
- QAT (quantization-aware training)
- GGUF for edge deployment
- Quantization error analysis & calibration

###### Topic: LLM Evaluation (Research Depth)

- HELM, MMLU, TruthfulQA at depth
- Custom benchmark design
- Contamination detection methodology
- Human evaluation design

## Data Scientist (DS)

### Tier F

#### SKILL: Scientific Methodology & Research Ethics

`Tier: F` | `Roles: DS` | **Max Level: 5** | **Prerequisites: None**

###### Topic: The Scientific Method

- Hypothesis generation: Falsifiability and the NHST paradigm
- Reproducibility and Open Science: Version control for research (Git, DVC)
- Designing studies: Controlled vs. Observational vs. Natural experiments
- Power and Sample Size intuition for research design

###### Topic: Analysis Ethics & Bias

- Data Privacy & Anonymization (GDPR/PII principles for Analysts)
- Identifying Selection Bias, Measurement Bias, and Survivorship Bias
- Ethical implications of data collection and algorithmic outcomes
- Avoiding "p-hacking," Data Dredging, and HARKing (Hypothesizing After Results are Known)

---

#### SKILL: Calculus

`Tier: F` | `Roles: MLE, DS`

###### Topic: Limits & Continuity

- Limit definition & evaluation
- Continuity & differentiability
- L'Hôpital's rule
- Epsilon-delta intuition

###### Topic: Differentiation

- Derivatives & chain rule
- Why chain rule = backpropagation
- Computational graph mechanics
- Symbolic vs numerical differentiation
- Partial derivatives
- Gradient & directional derivative
- Jacobian & Hessian [MLE]
- Jacobian: vector-valued function derivatives
- Hessian in model sensitivity analysis
- Hessian-free optimization methods

###### Topic: Integration

- Definite & indefinite integrals
- Fundamental theorem of calculus
- Integration by parts & substitution
- Multiple integrals (double, triple)

###### Topic: Optimization

- Critical points & second derivative test
- Gradient descent mechanics
- Lagrange multipliers (constrained optimization)
- Convexity & saddle points

#### SKILL: Linear Algebra

`Tier: F` | `Roles: MLE, DS`

###### Topic: Vectors & Spaces

- Vector operations, dot & cross product
- Linear independence & span
- Basis & change of basis
- Vector spaces & subspaces

###### Topic: Matrix Operations

- Matrix multiplication & transpose
- Element-wise vs matrix operations
- Broadcasting mechanics
- Batch operations (tensors as generalized matrices)
- Inverse & determinant
- Systems of linear equations (Gaussian elimination)
- LU, QR decompositions

###### Topic: Eigenstructure

- Eigenvalues & eigenvectors
- Geometric interpretation
- Characteristic polynomial
- Power iteration method
- Diagonalization
- Why diagonalization simplifies computation
- Application in PCA & covariance matrices
- SVD (Singular Value Decomposition)
- PCA from SVD

###### Topic: ML Applications

- Matrix form of linear regression
- Attention as matrix operations
- Covariance matrices
- Tensor operations & broadcasting

#### SKILL: Statistics

`Tier: F` | `Roles: MLE, DS, DE`

###### Topic: Descriptive Statistics

- Central tendency & spread (mean, variance, std, IQR)
- Frequency measures
- Skewness & kurtosis
- Normality tests (Shapiro-Wilk, Q-Q plots)
- Linear & non-linear relationships (Pearson, Spearman)
- Independent & dependent variables
- Variable types (continuous, categorical, ordinal)
- Relationship direction & strength
- Visualization literacy

###### Topic: Probability

- Continuous vs discrete functions
- Random variables & distributions
- Discrete: Binomial, Poisson, Geometric
- Continuous: Uniform, Exponential, Beta, Normal
- Gaussian / normal distribution
- Bayes' theorem
- Conditional probability mechanics
- Prior, likelihood, posterior intro
- Expectation & variance

###### Topic: Inferential Statistics

- Hypothesis testing (Null vs Alternative)
- Type I & II errors (power, alpha, beta)
- Central Limit Theorem
- Why CLT enables parametric testing
- When CLT breaks (heavy tails, small n)
- t-Test & z-Test (one-sample, two-sample, paired)
- p-value interpretation & misinterpretation
- Confidence intervals & bootstrap CI
- Regression & residuals (R², adjusted R², F-statistic)
- One-way & two-way ANOVA
- Chi-square test
- Goodness of fit
- Homoscedasticity tests (Breusch-Pagan, Levene)
- Multiple comparisons
- Permutation tests ← NEW
- Bootstrap hypothesis testing ← NEW

###### Topic: Bayesian Statistics Intro ← NEW topic

- Thinking like a Bayesian (prior beliefs updated by evidence)
- Prior & posterior distributions
- Conjugate priors (Beta-Binomial, Normal-Normal)
- Bayesian credible intervals vs frequentist CI
- When Bayesian vs frequentist approach makes sense
- Bridge to full Bayesian ML skill (Senior tier)

###### Topic: Statistical Learning Theory

- Bias-variance tradeoff
- Sample size & statistical power
- Effect size (Cohen's d, η²), power analysis (1-β), MDE
- MLE & MAP
- Cross-validation
- Information criteria (AIC/BIC)
- Survival analysis (Kaplan-Meier, Cox PH, time-to-event features)

#### SKILL: Python

`Tier: F` | `Roles: MLE, DS, DE, AIE`

###### Topic: Core Language

- Python syntax & logic (variables, control flow, functions, scope, error handling)
- Data Structures (lists, dicts, sets, tuples, comprehensions)

###### Topic: OOP

- Classes & inheritance
- Dunder methods
- Dataclasses & ABCs
- Mixins & composition

###### Topic: Functional Patterns

- Lambdas & decorators
- map / filter / reduce
- Closures
- Itertools

###### Topic: Generators & Memory

- Generator expressions & yield
- Lazy evaluation mechanics
- Memory-efficient data streams

###### Topic: Modules & Packaging ← NEW topic

- Module system (imports, **init**.py, **all**)
- Package structure for ML projects
- virtualenv, Pip, requirements.txt
- pyproject.toml & build backends
- Namespace packages
- Publishing to PyPI basics

###### Topic: Typing & Linting

- Type hints
- Pydantic schemas & validation
- mypy, pyright static analysis
- Linting tools (Black, Flake8, isort, Ruff)
- IDE integration (VSCode, DataSpell, Jupyter)

###### Topic: Concurrency

- AsyncIO fundamentals, async/await
- Threading vs multiprocessing
- Locks & queues
- Use cases: streaming, training, deployment

###### Topic: Performance & Debugging

- Memory profiling (Memray), performance tracing (Viztracer)
- Vectorization (numpy, pandas, numba)
- timeit, cProfile, memory_profiler
- Common bottleneck patterns in ML code

###### Topic: Python Libraries

- Data Analysis: pandas, numpy
- Numerical & Scientific: scipy, statsmodels
- Visualization: matplotlib, seaborn, plotly
- ML Toolkits: scikit-learn, XGBoost
- DL Toolkits: PyTorch, TensorFlow
- PEP8, docstrings, clean code standards

#### SKILL: SQL

`Tier: F` | `Roles: MLE, DS, DE, AIE`

###### Topic: Foundations

- DDL (CREATE, ALTER, DROP)
- DML (SELECT, INSERT, UPDATE, DELETE)
- Filtering, sorting, GROUP BY, HAVING

###### Topic: Joins & Set Operations

- INNER / LEFT / RIGHT / FULL joins
- Self-joins
- UNION / INTERSECT / EXCEPT
- Subqueries & CTEs

###### Topic: Window Functions

- ROW_NUMBER, RANK, DENSE_RANK
- LAG / LEAD (time-series patterns)
- Running totals & moving averages
- PARTITION BY semantics
- Sessionization patterns (30-min gaps)

###### Topic: Performance & Design

- Query execution plans
- Indexing strategies
- Query optimization patterns
- Normalization & schema design (Star, Snowflake)
- Transactions & ACID / isolation levels

###### Topic: Cloud Query Engines

- AWS Athena (serverless SQL on S3)
- BigQuery (slots, columnar, partitioning)
- Snowflake (semi-structured data, VARIANT type)
- Redshift patterns

#### SKILL: DSA

`Tier: F` | `Roles: MLE, DS, DE`

###### Topic: Core Data Structures

- Arrays, linked lists, stacks, queues
- Hash maps & collision strategies
- Trees (BST, AVL, Red-Black)
- Heaps & priority queues

###### Topic: Graph Structures & Algorithms

- Representation (adjacency list/matrix)
- BFS & DFS
- Shortest paths (Dijkstra, Bellman-Ford)
- Topological sort & SCC
- DAG prerequisite: Discrete Math → Graph Theory

###### Topic: Algorithm Design Patterns

- Two pointers & sliding window
- Divide & conquer
- Dynamic programming (memoization vs tabulation)
- Greedy & backtracking
- Recursion, sorting, search
- Bit manipulation ← NEW
- Segment trees & Binary Indexed Trees (FAANG) ← NEW

###### Topic: Complexity Analysis

- Big-O, Big-Θ, Big-Ω
- Time vs space tradeoffs
- Amortized analysis
- NP-completeness basics

### Tier 1

#### SKILL: Inference-Focused Predictive Modeling

`Tier: 1T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Statistics Lv 6, Linear Algebra Lv 5**

###### Topic: Linear Model Interpretation & Diagnostics

- Multiple Linear Regression: Coefficient interpretation and Elasticity
- Assumptions: Linearity, Normality, Homoscedasticity, Independence (Gauss-Markov)
- Residual Analysis: Breusch-Pagan, Durbin-Watson, and Q-Q plots
- Diagnostics: Cook’s Distance, Leverage, and Variance Inflation Factor (VIF)

###### Topic: Classification & Probability Calibration

- Logistic Regression and Odds Ratios interpretation
- Maximum Likelihood Estimation (MLE) intuition for classification
- Model Calibration: Brier Score, Reliability Diagrams, and Platt Scaling
- Evaluation beyond Accuracy: Precision-Recall curves and F-beta scores

---

#### SKILL: Exploratory Data Analysis (EDA) & Narrative Visualization

`Tier: 1T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Python Lv 5, Statistics Lv 5**

###### Topic: Statistical Profiling & Cleaning

- Data Quality: Identifying MCAR, MAR, and MNAR missingness mechanisms
- Univariate and Multivariate Outlier detection (Tukey, Mahalanobis distance)
- Feature association: Cramer's V, Theil's U, and non-linear correlation (MIC)
- Imputation strategies: Mean/Median vs. KNN vs. Iterative Imputer

###### Topic: Grammar of Graphics & Visual Perception

- Grammar of Graphics implementation (Plotnine/ggplot2 philosophy)
- Visual Encoding: Pre-attentive attributes (Position, Length, Color, Hue)
- Choosing the right chart: Comparison, Distribution, Composition, and Relationship
- Tufte’s Principles: Data-Ink ratio, Sparklines, and Avoiding Chartjunk

#### SKILL: Technical Communication

`Tier: 1T` | `Roles: MLE, DS, AIE`

###### Topic: ML Communication

- Explaining ML concepts to non-technical stakeholders
- Visual design for ML results
- Slide preparation for ML projects
- Writing ML system design documents (ADRs)

###### Topic: Interview Readiness

- Coding & ML interviews (Python, SQL, ML models)
- DS + ML system design interviews
- Live coding preparation (LeetCode, Interview Query)

#### SKILL: Experimentation

`Tier: 1T` | `Roles: DS, MLE`

###### Topic: A/B Testing

- Experiment design (units, metrics, randomization)
- A/A testing (sanity check, variance estimation)
- Statistical power & sample size calculation
- Pitfalls (novelty effect, Simpson's paradox, peeking)

###### Topic: Sequential & Adaptive Testing

- SPRT (Sequential Probability Ratio Test)
- Always-valid inference
- Multi-armed bandits (epsilon-greedy, UCB, Thompson sampling)
- Contextual bandits

###### Topic: Experiment Analysis

- CUPED & variance reduction
- CUPAC (covariate-adjusted, DoorDash/Microsoft patterns)
- Stratification (pre vs post)
- Heterogeneous treatment effects
- Novelty & primacy effects diagnosis
- Long-term effect estimation (surrogates, holdouts)

###### Topic: Platform & Engineering

- Experiment logging & assignment systems
- Feature flags & rollout strategies
- Metric pipelines & guardrail metrics
- Interaction effects across concurrent experiments

#### SKILL: Data Engineering

`Tier: 1T` | `Roles: DE, MLE, DS`

###### Topic: Data Warehouse & Lakehouse

- OLTP vs OLAP design principles
- Snowflake (virtual warehouses, Snowpark, cost management, semi-structured data)
- Databricks & Delta Lake (Spark, ACID, Z-ordering, Unity Catalog)
- BigQuery (slots, columnar, partitioning, BigQuery ML)
- Redshift & S3/HDFS data lakes
- Lakehouse patterns (Bronze/Silver/Gold)

###### Topic: Data Modeling ← NEW standalone topic

- Dimensional modeling fundamentals (Kimball methodology)
- Star schema design (fact tables, dimension tables)
- Snowflake schema (normalized dimensions)
- Data Vault methodology (hubs, links, satellites)
- Slowly Changing Dimensions (SCD Types 1, 2, 3, 4)
- Normalization vs denormalization trade-offs
- Schema evolution & backward compatibility

###### Topic: Data Ingestion & ETL

- Batch ingestion patterns
- ETL vs ELT paradigm shift
- Change data capture (CDC)
- Schema evolution & data contracts
- AWS Glue (Crawlers, Jobs, Catalog)
- File formats (CSV, JSON, Parquet, Avro, ORC)

###### Topic: Data Transformation

- dbt core (models, sources, macros, tests, lineage)
- SQL transformation patterns
- Incremental models & SCD types
- Data quality (Great Expectations, Deequ)

###### Topic: Streaming Data

- Kafka (topics, partitions, consumers, KSQL, Kafka Connect)
- Spark (RDDs, DataFrames, SparkSQL, Catalyst, MLlib)
- Flink (stateful ops, windowing, event time, late data)
- Streaming vs micro-batch semantics

###### Topic: Pipeline Orchestration

- Airflow (DAG anatomy, TaskFlow API, XComs, K8s operator)
- Prefect & modern orchestration alternatives
- Pipeline design patterns (idempotency, backfill)
- Data lineage & observability
- Workflow versioning (GitOps, DVC)

###### Topic: Metadata Management ← NEW topic

- Data catalog concepts (discoverability, ownership)
- OpenMetadata, Apache Atlas, DataHub
- Data lineage graph design
- Data contracts & schema registry
- Column-level lineage
- Data governance frameworks

#### SKILL: Stochastic Processes & Simulation

`Tier: 1T` | `Roles: DS, MLE`

###### Topic: Probability Foundations

- Random variables & distributions (discrete & continuous)
- Expectation, variance, moment generating functions
- Law of large numbers & CLT
- Conditional expectation & independence

###### Topic: Stochastic Processes

- Markov chains (discrete & continuous time)
- Poisson processes
- Brownian motion & Wiener process
- Martingales & optional stopping

###### Topic: Simulation Methods

- Monte Carlo fundamentals
- Variance reduction (importance sampling, antithetic variates)
- MCMC (Metropolis-Hastings, Gibbs)
- Bootstrapping & permutation tests

###### Topic: Applied Stochastic Models

- Hidden Markov Models (HMMs)
- Queueing theory basics
- Stochastic differential equations (Itô basics)
- Bayesian filtering (Kalman, particle filters)

#### SKILL: Machine Learning Classical

`Tier: 1T` | `Roles: MLE, DS, AIE`

###### Topic: Statistical Foundations

- Statistical & foundational techniques in ML
- Role of statistics in ML
- Parametric vs non-parametric methods
- Assumptions underlying ML models
- Independent & dependent variables in ML context
- Features (X) vs target (y) framing
- Variable selection principles
- Defining models (function approximation framing)
- Model capacity & inductive bias
- Hypothesis class & complexity

###### Topic: Learning Paradigms

- Labeled data (what makes data labeled, label quality, annotation strategies)
- Supervised learning (learning from (X,y) pairs, generalization goal)
- Unsupervised learning (learning from X only, structure discovery)
- Semi-supervised learning
- When labels are scarce
- Self-training, co-training, pseudo-labeling
- Label propagation
- Self-supervised learning
- Pretext tasks (rotation, colorization, jigsaw)
- Contrastive learning (SimCLR, MoCo)
- Masked autoencoders
- Relation to foundation models
- Reinforcement learning intro (cross-ref RL skill)

###### Topic: Supervised Learning

- Linear regression (OLS, assumptions, coefficient interpretation)
- Logistic regression (odds ratio, log-odds, decision boundary)
- Naive Bayes
- Decision trees
- SVMs (cross-ref Math Optimization → Convex QP)
- Ridge & Lasso regression (L1 vs L2 regularization mechanics)
- kNN
- Gradient Boosting: XGBoost, LightGBM

###### Topic: Regularization

- Why regularization? (overfitting prevention)
- L1 (Lasso) — sparsity inducing
- L2 (Ridge) — weight shrinkage
- Elastic Net (L1 + L2 combination)
- Dropout (cross-ref Deep Learning)
- Early stopping
- Data augmentation as regularization
- Bayesian interpretation of regularization

###### Topic: Unsupervised Learning

- k-means & DBSCAN
- Hierarchical clustering
- PCA & dimensionality reduction / LDA
- Gaussian mixture models
- Anomaly detection

###### Topic: Ensemble Methods

- Bagging & random forests
- Boosting (XGBoost, LightGBM)
- Stacking & feature importance

###### Topic: Model Evaluation

- Defining train/test set splits
- Hold-out split rationale, train/val/test distinction
- Data leakage prevention, stratified splitting
- Model underfitting & overfitting
- Diagnosing with learning curves, bias-variance decomposition
- Model selection (hyperparameter tuning, cross-validation, AIC/BIC)
- Metrics — classification (Accuracy, Precision, Recall, F1, ROC-AUC, Log Loss)
- Metrics — regression (MAE, RMSE, R², MAPE)
- Trade-offs in evaluation metrics
- Precision-recall tradeoff, sensitivity vs specificity
- Business metric alignment
- When accuracy is misleading (imbalanced classes)
- Additional offline evaluation methods
- Backtesting, temporal validation, simulation-based, counterfactual
- K-Fold cross-validation, calibration

###### Topic: Feature Engineering

- Encoding strategies (ordinal, target, one-hot, embeddings)
- Target encoding leakage prevention ← NEW
- Embeddings for categorical features (entity embeddings) ← NEW
- Numerical transformations (scaling, binning, interactions)
- Handling missing data (imputation strategies)
- Feature selection (filter, wrapper, embedded methods)
- Feature stores & reuse patterns

###### Topic: scikit-learn

- Estimator API & pipeline objects
- ColumnTransformer & preprocessing pipelines
- Custom transformers & estimators
- Model persistence & versioning

###### Topic: Recommender Systems

- Problem framing (collaborative, content-based, hybrid)
- Explicit & implicit ratings
- Explicit: star ratings, reviews
- Implicit: clicks, views, purchases
- Confidence weighting for implicit feedback
- Collaborative filtering (user-based, item-based, scalability challenges)
- Content-based filtering (TF-IDF & embedding-based, feature representation)
- User-based/item-based vs content-based comparison
- Cold start problem per method
- Matrix factorization (SVD, ALS, iALS for implicit)
- Two-tower retrieval models ← NEW
- User tower & item tower architecture
- Approximate nearest neighbor at inference
- Learning to Rank (LTR) ← NEW topic
- Pointwise (regression on relevance)
- Pairwise (RankNet, LambdaRank)
- Listwise (LambdaMART, SoftmaxNDCG)
- Session-based recommendation ← NEW
- Sequential patterns & recency bias
- RNN/Transformer-based session models
- Knowledge graph embeddings for RecSys ← NEW
- TransE, RotatE, KGE for item enrichment
- Entity linking and graph traversal for recommendations
- Neural models (Autoencoders, Neural CF)
- Evaluation (NDCG, MAP, hit rate)

#### SKILL: ML Project Lifecycle

`Tier: 1T` | `Roles: MLE, DS, AIE`

###### Topic: Defining an ML Problem

- Business problem → ML problem translation
- Is ML the right solution?
- Scoping & success metrics
- Stakeholder alignment (defining ground truth, performance baselines, ROI)
- Problem types taxonomy (classification, regression, ranking, generation)
- Online vs offline prediction, batch vs real-time

###### Topic: Data Acquisition

- Data source identification (internal DBs, third-party, scraping, APIs)
- Synthetic data generation (cross-ref Gen AI)
- Active learning (query by committee, uncertainty sampling)
- Crowdsourcing & labeling pipelines, data flywheel
- Data quality assessment (completeness, consistency, sampling bias)
- Schema validation (Great Expectations)

###### Topic: Exploratory Data Analysis

- EDA in the ML lifecycle context
- Hypothesis generation from data
- Feature-target relationship analysis
- Data distribution shifts (train vs production)
- Multicollinearity detection

###### Topic: Model Training

- Training pipeline anatomy
- Data loading & batching
- Forward pass, loss computation, backpropagation & parameter update
- Epoch, iteration, step definitions
- Experiment management (reproducibility, hyperparameter search, cost management)
- Iterative improvement loop (error analysis, augmentation decisions)

###### Topic: Model Evaluation (Lifecycle)

- Offline vs online evaluation distinction
- A/B testing for model evaluation
- Shadow mode evaluation
- Evaluation on subgroups (slicing)
- Trade-offs in evaluation metrics (business vs technical)
- Backtesting pipelines, counterfactual evaluation, simulation

###### Topic: End-to-End Machine Learning

- Full pipeline: data → model → serving → monitoring
- ML system components map
- From notebook to production path
- Feature pipeline design (online vs offline)
- Model versioning (model cards, semantic versioning, rollback)
- Common failure modes in production ML

###### Topic: Deployment Environments

- Cloud environments (AWS, GCP, Azure trade-offs, managed vs self-hosted, cost)
- Local environments (Docker for local parity, GPU setup, dev→staging→prod)
- On-device / edge ML
- When on-device makes sense (latency, privacy, offline)
- TF Lite, ONNX Runtime, Core ML
- Model compression for edge (quantization, pruning)
- Android/iOS deployment patterns
- Federated learning basics

#### SKILL: Data Science Workflow

`Tier: 1T` | `Roles: DS, MLE`

###### Topic: EDA

- Univariate analysis (distributions, outliers, missing)
- Bivariate & multivariate analysis
- Distribution plots (KDE, violin, ECDF)
- Relationship plots (scatter matrix, heatmap)
- Temporal & geospatial EDA
- EDA-driven hypothesis generation

###### Topic: Data Cleaning

- Missing data strategies (MCAR/MAR/MNAR diagnosis)
- Outlier detection & treatment
- Type coercion & schema enforcement
- Deduplication strategies
- String cleaning & normalization

###### Topic: Anomaly Detection

- Statistical methods (Z-score, IQR, GESD)
- Isolation Forest & LOF
- Autoencoders for anomaly detection
- Time-series anomaly detection
- Evaluation (precision@k, labeling challenges)

###### Topic: Domain Applications

- Fraud Detection (class imbalance, graph-based, real-time scoring)
- Customer Analytics (segmentation RFM, churn, LTV, attribution)
- AdTech & Programmatic Bidding (CTR prediction, budget pacing)
- E-commerce & RecSys Applications (product ranking, personalization)

#### SKILL: Software Engineering for ML

`Tier: 1T` | `Roles: MLE, DS, DE, AIE`

###### Topic: Version Control

- Git fundamentals (add, commit, branching, core commands)
- Conventional Commits spec
- Trunk-based development & GitFlow
- GitHub workflows (fork, PR, issues, milestones)
- First open-source contribution
- Git for data & model versioning (DVC)
- GitOps & CI pipeline triggers

###### Topic: Testing

- Unit testing (pytest) — fixtures, parametrize, mocking
- Integration testing — pipeline, API contract, E2E
- ML-specific testing (model behavior, data validation, performance regression, shadow mode)
- Test-Driven Development for ML

###### Topic: Environment Management

- Virtual environments (pyenv, venv)
- Dependency management (Poetry, pip-tools)
- Docker for ML (Dockerfile, Docker Compose, multi-stage, GPU passthrough)
- Reproducibility patterns (lock files, env-as-code)

###### Topic: CI/CD

- GitHub Actions (workflows, matrix builds, secrets, reusable)
- GitLab CI patterns
- Pre-commit hooks & linting
- Automated test gates
- Deployment pipelines

###### Topic: Code Quality

- Code reviews (ML code checklist, PR hygiene, notebooks vs modules)
- Refactoring ML code (notebook → module)
- Type hints, PEP8, docstrings
- Code smell detection in DS workflows

### Tier 2

#### SKILL: Strategic Data Storytelling & Decision Support

`Tier: 2T` | `Roles: DS` | **Max Level: 5** | **Prerequisites: EDA & Visualization Lv 7, Technical Communication Lv 3**

###### Topic: Narrative Frameworks & Influence

- The "Data Story" arc: Context, Conflict, and Actionable Resolution
- Audience Centricity: Adapting technical depth for C-Suite vs. Product Managers
- Visualizing Uncertainty: Communicating Confidence Intervals and P-values to laypeople
- Executive Summaries: Translating model metrics to Business ROI/Impact

###### Topic: Analytical Product Design

- Interactive Dashboard Design: Information Hierarchy and Navigation (Streamlit, Shiny)
- Automated Reporting: Reproducible research via Quarto or RMarkdown
- Self-serve Analytics: Designing tools that empower stakeholders without DS intervention
- Defining Metric Sensitivity vs. Noise for executive reporting

---

#### SKILL: Generalized Linear Models (GLM) & Robust Statistics

`Tier: 2T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Inference-Focused Modeling Lv 5, Statistics Lv 7**

###### Topic: Exponential Family & Link Functions

- Systematic component, Random component, and the Link Function
- Poisson and Negative Binomial Regression for count data (Overdispersion)
- Gamma and Inverse-Gaussian Regression for skewed continuous data (e.g., Insurance/Cost)
- Binomial and Multinomial Logit/Probit models

###### Topic: Robust & Non-parametric Estimation

- M-estimators and Robust Regression (Huber, Bisquare, RANSAC)
- Quantile Regression: Modeling the median and extremals (0.1, 0.9)
- Rank-based tests and Non-parametric ANOVA (Kruskal-Wallis, Friedman)
- Resampling techniques: Jackknife and Bootstrap for complex estimators

#### SKILL: Computer Vision

`Tier: 2T` | `Roles: MLE, AIE, DS`

###### Topic: Classical CV

- Image representation (pixels, channels, histograms)
- Filtering & convolution (Gaussian, Sobel, Laplacian)
- Feature detection (SIFT, ORB, Harris corners)
- Traditional pipelines (HOG + SVM, watershed)

###### Topic: Deep CV — Classification

- CNN architecture patterns (VGG, ResNet, EfficientNet)
- Transfer learning & fine-tuning
- Common image datasets (ImageNet, CIFAR-10/100, COCO, Open Images)
- Data augmentation strategies
- Evaluation (top-k accuracy, confusion matrix)

###### Topic: Deep CV — Detection & Segmentation

- Anchor-based detection (YOLO, Faster R-CNN)
- Semantic vs instance segmentation (U-Net, Mask R-CNN)
- mAP & IoU metrics
- Panoptic segmentation

###### Topic: Generative Models in CV

- GANs for image generation (StyleGAN, DCGAN, CycleGAN, Conditional GANs)
- Diffusion models (DDPM, Stable Diffusion)
- VAEs for vision

###### Topic: Self-supervised CV ← NEW topic

- DINO & DINOv2 (self-distillation for visual features)
- MAE for vision (masked image modeling)
- CLIP pretraining (cross-ref Gen AI → Multimodal)
- Contrastive learning in vision (MoCo, SimCLR)
- Downstream task transfer from self-supervised features

###### Topic: OCR & Document Understanding

- Classical OCR (Tesseract, preprocessing)
- Deep learning OCR (CRNN, attention-based)
- Layout analysis & document parsing
- Production OCR pipelines
- AWS Textract

###### Topic: Advanced Topics

- Vision Transformers (ViT, DINO)
- Multimodal models (CLIP, Flamingo)
- 3D vision & depth estimation
- Video understanding basics
- Neural Radiance Fields (NeRF) ← NEW
- Segment Anything Model (SAM) ← NEW

#### SKILL: NLP

`Tier: 2T` | `Roles: MLE, DS, AIE`

###### Topic: NLP Foundations

- Text as sequence of symbols vs continuous data
- Ambiguity: lexical, syntactic, semantic, pragmatic
- Curse of dimensionality in text
- Language as probability distributions over sequences
- Morphology, syntax, semantics, pragmatics
- Constituency & dependency parsing
- Coreference resolution ← NEW explicit
- NLP task taxonomy (classification, generation, extraction, translation)
- Discriminative vs generative NLP models
- NLP pipeline vs end-to-end models

###### Topic: Text Preprocessing

- Tokenization (rule-based, BPE, WordPiece)
- Normalization (lowercasing, stemming, lemmatization)
- Stop word removal & noise cleaning
- Handling unstructured text (encoding, HTML, unicode)
- Feature extraction (TF-IDF, BoW, n-grams)

###### Topic: Classical NLP

- Text classification pipeline end-to-end
- Sentiment analysis (lexicon vs ML-based)
- Named Entity Recognition (NER) (rule-based, CRF-based, entity-level F1)
- Topic modeling (LDA, NMF, coherence score)
- Building a text classifier
- Information extraction patterns
- Relation extraction ← NEW

###### Topic: Neural NLP

- Word embeddings (Word2Vec, GloVe, FastText)
- RNN, LSTM for NLP (seq2seq, language modeling, bidirectional)
- Language modeling & perplexity
- Transfer learning in NLP (fine-tuning BERT)
- Structured output (JSON, Tables, Markdown)

###### Topic: BERT Models

- BERT architecture (bidirectional encoder, MLM + NSP)
- WordPiece tokenization, [CLS] & [SEP] tokens
- BERT variants (RoBERTa, ALBERT, DistilBERT)
- Fine-tuning BERT (classification, NER, QA)
- Task-specific heads
- When to use BERT vs generative models

###### Topic: GPT & Generative NLP Models

- GPT architecture (autoregressive / causal LM, decoder-only)
- GPT variants (GPT-2, GPT-3, GPT-4 family)
- Open-source alternatives (LLaMA, Mistral)
- Prompting as an NLP technique

###### Topic: Multilingual & Cross-lingual NLP ← NEW topic

- Multilingual BERT (mBERT) & XLM-RoBERTa
- Cross-lingual transfer learning
- Language detection
- Zero-shot & few-shot cross-lingual transfer
- Multilingual tokenization strategies
- Low-resource language challenges

###### Topic: Document Understanding ← NEW topic

- Layout-aware models (LayoutLM, LayoutLMv3)
- Multi-page document processing
- Table extraction from documents
- Form understanding & key-value extraction
- Document Q&A
- Cross-ref: Computer Vision → OCR

###### Topic: NLP Evaluation

- BLEU score (machine translation)
- ROUGE score (summarization)
- Perplexity (language models)
- Entity-level F1 (NER)
- Human evaluation patterns

###### Topic: Speech

- Speech recognition pipeline (acoustic + language model)
- MFCC, Spectrograms (audio features)
- ASR evaluation (WER, CER)
- AWS Transcribe, Whisper patterns
- End-to-end ASR (DeepSpeech)

###### Topic: Dialogue Systems

- Chatbots & conversational AI
- Dialog management (state tracking)
- LLM-powered dialog vs traditional NLU

#### SKILL: Graph Machine Learning

`Tier: 2T` | `Roles: MLE, DS, AIE`
**Prerequisites:** ML Classical L5, Deep Learning L5, Discrete Math L4

###### Topic: Graph Fundamentals for ML

- Graph representation for ML (node features, edge features, graph features)
- Homogeneous vs heterogeneous graphs
- Temporal graphs & dynamic graphs
- Graph sampling strategies
- Graph datasets (Cora, Citeseer, OGB benchmarks)

###### Topic: Graph Neural Networks (GNNs)

- Message passing framework (aggregate → combine → update)
- Graph Convolutional Networks (GCN)
- GraphSAGE (inductive learning, neighborhood sampling)
- Graph Attention Networks (GAT)
- Graph Isomorphism Network (GIN — most expressive GNN)
- Expressive power & Weisfeiler-Leman hierarchy

###### Topic: Advanced GNN Architectures

- Heterogeneous GNNs (R-GCN, HGT)
- Temporal GNNs (TGN, DyRep)
- Graph Transformers (Graphormer, GPS)
- Scalable GNNs (ClusterGCN, GraphSAINT)
- Over-smoothing & over-squashing problem

###### Topic: Graph Self-supervised Learning

- Link prediction pretraining
- Contrastive learning on graphs (GraphCL, GRACE)
- Graph autoencoders (GAE, VGAE)
- Cross-ref: Deep Learning → Self-supervised

###### Topic: GNN Applications

- Fraud detection on transaction graphs
- Molecular property prediction (drug discovery)
- Knowledge graph completion (TransE, RotatE)
- RecSys with graph structure (PinSage)
- Social network analysis

###### Topic: Evaluation & Tooling

- Node, edge, graph-level task metrics
- PyTorch Geometric (PyG)
- Deep Graph Library (DGL)
- OGB (Open Graph Benchmark)

#### SKILL: Time Series

`Tier: 2T` | `Roles: DS, MLE`

###### Topic: Foundations

- Stationarity & unit root tests (ADF, KPSS)
- Autocorrelation (ACF / PACF)
- Decomposition (trend, seasonality, residuals)
- Resampling, rolling windows, lag features
- shift(), rolling(), expanding() patterns
- NumPy: percentiles, IQR outlier detection

###### Topic: Classical Forecasting

- ARIMA & SARIMA
- Exponential smoothing (ETS, Holt-Winters)
- VAR for multivariate series
- Forecast evaluation (MAE, RMSE, MASE, CRPS)

###### Topic: ML-based Forecasting

- Feature engineering for tabular models
- Gradient boosting for TS (LightGBM patterns)
- Global vs local models
- Walk-forward cross-validation

###### Topic: Deep Learning Forecasting

- Seq2seq & dilated convolutions (WaveNet)
- Temporal Fusion Transformer (TFT)
- N-BEATS & N-HiTS
- PatchTST ← NEW
- iTransformer ← NEW
- TimeGPT (foundation model for TS) ← NEW
- Probabilistic forecasting & conformal intervals

#### SKILL: Bayesian ML

`Tier: 2T` | `Roles: DS, MLE`

###### Topic: Bayesian Foundations

- Prior, likelihood, posterior
- Conjugate priors & closed-form posteriors
- Bayesian vs frequentist decision theory
- Predictive distributions & model evidence

###### Topic: Approximate Inference

- MCMC (Metropolis-Hastings, HMC, NUTS)
- Variational inference (ELBO, mean-field)
- Expectation propagation
- Laplace approximation

###### Topic: Probabilistic Graphical Models ← NEW topic

- Factor graphs & factor graph inference
- Belief propagation (sum-product, max-product)
- Conditional Random Fields (CRF) (cross-ref NLP → NER)
- Directed vs undirected graphical models
- Plate notation for hierarchical models

###### Topic: Probabilistic Models

- Bayesian linear & logistic regression
- Gaussian processes (GP regression & classification)
- Bayesian neural networks
- Latent variable models (VAE from Bayesian lens)

###### Topic: Bayesian Tooling & Applications

- PyMC & Stan (probabilistic programming)
- Uncertainty quantification in production
- Bayesian optimization (BoTorch)
- Bayesian A/B testing & decision making

#### SKILL: Explainable AI

`Tier: 2T` | `Roles: MLE, DS, AIE`|

###### Topic: Interpretability Foundations

- Interpretable vs explainable distinction
- Global vs local explanations
- Model-agnostic vs model-specific methods
- Faithfulness, stability, comprehensibility tradeoffs

###### Topic: Feature Attribution Methods

- SHAP (Shapley, TreeSHAP, KernelSHAP, DeepSHAP, NLP/CV)
- LIME (local surrogate, stability & fidelity limitations)
- Integrated Gradients
- Permutation importance

###### Topic: Model-specific Interpretability

- Linear model coefficients & confidence
- Decision tree & rule extraction
- Attention visualization (caveats — not explanation)
- Concept activation vectors (TCAV)

###### Topic: Applied XAI

- Regulatory context (EU AI Act, model cards)
- Fairness & bias auditing
- XAI in production (explanation APIs)
- Human-in-the-loop XAI workflows

#### SKILL: Geospatial Analysis (Optional)

`Tier: 2T` | `Roles: DS` |

###### Topic: Foundations

- CRS & projections (WGS84, UTM, EPSG codes)
- Vector vs raster data models
- Geometry types (Point, Line, Polygon)
- Spatial indexing (R-tree, H3, S2)

###### Topic: Vector Analysis

- Spatial joins & overlays
- Buffering, clipping, dissolve
- GeoPandas & Shapely patterns
- OpenStreetMap & PostGIS

###### Topic: Raster Analysis

- Rasterio & GDAL basics
- Band math & NDVI
- Terrain analysis (slope, aspect)
- Satellite imagery pipelines

###### Topic: Spatial ML

- Spatial autocorrelation (Moran's I)
- Kriging & spatial interpolation
- Point cloud processing (LiDAR)
- Movement & trajectory analysis

#### SKILL: Causal Inference

`Tier: 2T` | `Roles: DS`

###### Topic: Causal Foundations

- Potential outcomes framework (Rubin causal model)
- DAGs (cross-ref: Discrete Math → Graph Theory)
- Confounding, colliders, mediators
- Identification assumptions (SUTVA, ignorability)

###### Topic: Observational Methods

- Matching & propensity score methods
- Propensity score overlap diagnostics ← NEW
- Inverse probability weighting (IPW)
- Doubly robust estimation
- Sensitivity analysis (Rosenbaum bounds)
- Regression discontinuity bandwidth selection ← NEW

###### Topic: Network Interference & SUTVA Violations ← NEW topic

- When SUTVA fails (network effects, spillovers)
- Cluster randomization as solution
- Network experiment design (ego-network, bipartite)
- Interference-robust estimators
- Social contagion vs homophily distinction

###### Topic: Quasi-Experimental Methods

- Difference-in-differences (DiD) & parallel trends
- Staggered DiD & event study designs ← NEW
- Regression discontinuity design (RDD)
- Instrumental variables (IV)
- Synthetic control method
- Target trial emulation

###### Topic: ML-based Causal Methods

- Causal forests & heterogeneous treatment effects
- Double machine learning (DML)
- CausalML & EconML libraries
- Uplift modeling

#### SKILL: Deep Learning

`Tier: 2T` | `Roles: MLE, DS, AIE`

###### Topic: Neural Network Fundamentals

- Forward pass mechanics
- Activation functions (ReLU, GELU, sigmoid, tanh, SiLU)
- Backpropagation algorithm
- Weight initialization
- Gradient flow & vanishing gradients
- Perceptrons & MLP

###### Topic: Training Dynamics

- Optimizers (SGD, Adam, AdamW)
- Learning rate schedules (cosine, warmup, cyclical)
- Regularization (dropout, weight decay, L1/L2)
- Normalization techniques ← NEW subtopics
- Batch normalization
- Layer Normalization (used in Transformers)
- Group Normalization (CV with small batches)
- RMS Normalization (LLMs)
- Spectral Normalization (GANs)
- Gradient clipping ← NEW
- Overfitting/underfitting strategies
- Loss landscape visualization ← NEW

###### Topic: Architectures

- CNNs & convolution intuition (cross-ref Computer Vision)
- RNNs, LSTM, GRU
- LSTM mechanics (input, forget, output gates)
- Vanishing gradient problem & why LSTM solves it
- Bidirectional LSTMs
- Seq2seq with LSTMs
- Residual connections
- Attention mechanism (prereq for Gen AI)
- GANs (generator/discriminator, mode collapse, DCGAN, StyleGAN, FID/IS)
- Self-supervised learning in DL ← NEW topic
- Masked Autoencoders (MAE)
- DINO (distillation with no labels)
- BYOL, SimSiam (self-supervised without negatives)
- Relation to pretraining paradigm

###### Topic: Practical Training

- GPU training
- Mixed precision (FP16/BF16)
- Gradient accumulation
- Distributed training (DDP, FSDP)

###### Topic: Model Adaptation & Compression

- Transfer learning & fine-tuning
- Common image datasets (ImageNet, CIFAR, COCO, Open Images)
- Feature extraction vs full fine-tuning
- Domain adaptation strategies
- Knowledge distillation
- LoRA, adapters (PEFT)
- Quantization & pruning (GPTQ, QAT, GGUF)

###### Topic: Meta-learning & Hypernetworks ← NEW topic

- Few-shot learning problem framing
- MAML (Model-Agnostic Meta-Learning)
- Prototypical Networks
- Hypernetworks (networks that generate weights for other networks)
- Neural process basics

###### Topic: DL Frameworks

- PyTorch (tensor ops, autograd, nn.Module, DataLoader, DDP/FSDP, torch.compile)
- TensorFlow / Keras (sequential/functional API, tf.data, TF Lite)

### Tier 2.5

#### SKILL: Longitudinal & Specialized Modeling

`Tier: 2.5T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: GLM Lv 7, Statistics Lv 8**

###### Topic: Survival Analysis (Time-to-Event)

- Kaplan-Meier estimator and Log-rank tests
- Cox Proportional Hazards Model and Hazard Ratio interpretation
- Non-proportional hazards and Time-varying covariates
- Accelerated Failure Time (AFT) models for duration modeling

###### Topic: Survey & Spatial Statistics

- Complex Survey Design: Stratification, Clustering, and Multistage Sampling
- Weighting: Design weights, Non-response adjustment, and Raking (Post-stratification)
- Spatial Statistics: Geographically Weighted Regression (GWR) and Spatial Autocorrelation

#### SKILL: Applied Causal Foundations & Matching

`Tier: 2.5T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: GLM Lv 6, Experimentation Lv 5**

###### Topic: Matching & Weighting Methods

- Propensity Score Matching (PSM) and Balancing Diagnostics
- Inverse Probability Weighting (IPW) and the Horvitz-Thompson estimator
- Coarsened Exact Matching (CEM) and Mahalanobis Matching
- Doubly Robust Estimation: Combining outcome modeling and weighting

###### Topic: Causal Discovery & Sensitivity

- Directed Acyclic Graphs (DAGs): Identification via Backdoor and Frontdoor criteria
- Sensitivity Analysis: Assessing the impact of unobserved confounders (Rosenbaum Bounds)
- Intro to Causal Discovery: Constraint-based (PC) vs. Score-based (GES) algorithms
- Mediation Analysis: Direct vs. Indirect treatment effects

#### SKILL: Decision Theory

`Tier: 2.5T` | `Roles: DS`

###### Topic: Bayesian Decision Framework

- Utility functions & loss functions
- Decision under uncertainty
- Expected value of information (EVPI, EVSI)
- Decision trees for sequential decisions

###### Topic: Applied Decision Making

- Risk aversion & risk measures (CVaR, VaR)
- Multi-criteria decision analysis (MCDA)
- Game theory basics (Nash equilibrium, Pareto optimality)
- Decision theory for ML model deployment

#### SKILL: Experimentation L9

`Tier: 2.5T` | `Roles: DS`

###### Topic: Platform Design

- Experiment platform architecture
- Assignment & logging at scale
- Metric aggregation pipelines
- Multi-cell experimental designs

###### Topic: Advanced Analysis

- Interaction effects across concurrent experiments
- Long-term holdout designs
- Surrogate metrics & causal surrogates
- Bayesian adaptive experimentation

#### SKILL: Bayesian ML L9

`Tier: 2.5T` | `Roles: DS`

###### Topic: Gaussian Processes (Advanced)

- GP regression & classification at depth
- Sparse GPs & inducing points
- Multi-output GPs
- Deep GPs

###### Topic: Bayesian Neural Networks

- Weight uncertainty via VI
- Monte Carlo Dropout
- Laplace approximation for NNs

###### Topic: Probabilistic Programming at Depth

- PyMC & Stan advanced patterns
- Custom distributions & likelihoods
- Hierarchical models
- Bayesian workflow (prior predictive checks, posterior predictive checks)

#### SKILL: Causal Inference L9

`Tier: 2.5T` | `Roles: DS`

###### Topic: Advanced Observational Methods

- Doubly robust estimation at depth
- Sensitivity analysis & bounds
- Marginal structural models
- G-estimation

###### Topic: Advanced Quasi-Experimental

- Staggered DiD & event study designs
- Fuzzy RDD
- Weak instruments diagnostics
- Local average treatment effect (LATE)

###### Topic: Causal ML Production

- DML in production systems
- Causal forest deployment
- Uplift modeling pipelines

#### SKILL: MLOps Observability

`Tier: 2.5S` | `Roles: MLE, DS`

###### Topic: Drift Detection

- Concept drift vs Data drift
- Statistical distance (Wasserstein, KL Divergence, PSI)
- Tooling (Evidently AI, NannyML)

###### Topic: Production Monitoring

- Prometheus metrics for ML (latency, throughput, error rates)
- Distributed tracing for LLMs (Arize Phoenix, LangSmith)
- Shadow deployment and A/B testing infrastructure

### Tier 3

#### SKILL: Forecasting & Structural Time Series at Scale

`Tier: 3T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Statistics Lv 8, Linear Algebra Lv 7, Python Lv 7**

###### Topic: Hierarchical Forecasting

- Reconciliation methods (Bottom-up, Top-down, MinT)
- Grouped Time Series and Temporal Hierarchies
- Global Forecasting Models (Cross-learning across series)

###### Topic: Advanced State Space Models

- Kalman Filters & Smoothers for dynamic systems
- Bayesian Structural Time Series (BSTS) for causal impact
- Vector Autoregression (VAR) and Cointegration in multivariate series
- Neural Forecasting: N-BEATS, DeepAR, and TFT (Temporal Fusion Transformers)

---

#### SKILL: Bayesian Inference & Probabilistic Programming

`Tier: 3T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Statistics Lv 9, Calculus Lv 8, Python Lv 8**

###### Topic: Probabilistic Frameworks

- Stan, PyMC, or Bean Machine internals
- Writing custom probability distributions and likelihoods
- Latent Variable Models (LDA, Hidden Markov Models)
- Gaussian Processes for regression and Bayesian Optimization

###### Topic: Computational Inference

- MCMC Algorithms: Hamiltonian Monte Carlo (HMC) & NUTS
- Variational Inference (ADVI) and Stochastic Variational Inference (SVI)
- Convergence diagnostics (R-hat, Effective Sample Size)
- Prior Predictive and Posterior Predictive checks

#### SKILL: Advanced Causal Inference & Econometrics

`Tier: 3T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Experimentation Lv 8, Statistics Lv 9, Python Lv 8**

###### Topic: Causal Machine Learning

- Double Machine Learning (DML) for treatment effect estimation
- Causal Forests and Generalized Random Forests (GRF)
- Heterogeneous Treatment Effects (HTE) discovery via Meta-learners (S, T, X, R-learners)
- Targeted Maximum Likelihood Estimation (TMLE)

###### Topic: Advanced Quasi-Experiments

- Synthetic Control Methods (Generalized Synthetic Control, Matrix Completion)
- Difference-in-Differences with multiple time periods (Staggered adoption)
- Instrumental Variables (IV) in high-dimensional settings
- Structural Equation Modeling (SEM) and Path Analysis

###### Topic: Interference & Network Effects

- SUTVA violations: Detection and mitigation
- Cluster Randomization and Spatial interference
- Bipartite Graph experiments for Marketplaces
- Switchback experiments: Design and power analysis

#### SKILL: Decision Theory L9

`Tier: 3T` | `Roles: DS`

###### Topic: Advanced Decision Under Uncertainty

- Sequential decision problems (MDPs from DS perspective)
- Bayesian adaptive trial design
- Dynamic treatment regimes
- Principal-agent problems

#### SKILL: Research Methodology

`Tier: 3T` | `Roles: DS`

###### Topic: Org-scale Experiment Design

- Measurement strategy & metric trees
- OKR alignment with experiment programs
- Switchback experiments & time-series designs
- Cross-functional experiment governance

###### Topic: Causal ML in Production

- DML deployment pipelines
- Causal forest serving
- Continuous treatment effect estimation
- Heterogeneous treatment effects at scale

### Tier 4

#### SKILL: DS Methodology Research & Innovation

`Tier: 4T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Advanced Causal Inference Lv 9, Bayesian Inference Lv 9, Statistics Lv 10**

###### Topic: Methodological Development

- Developing novel statistical estimators for domain-specific problems
- Meta-analysis of experimental results across the organization
- Reproducing and adapting SOTA Econometrics/Statistics papers to product use cases
- Establishing the organization's "Gold Standard" for internal experimentation and validation

#### SKILL: Responsible AI & Algorithmic Governance

`Tier: 4T` | `Roles: DS` | **Max Level: 10** | **Prerequisites: Statistics Lv 9, Technical Communication Lv 5, Python Lv 8**

###### Topic: Algorithmic Fairness

- Mathematical definitions of fairness (Demographic Parity, Equal Opportunity, Predictive Rate Parity)
- Bias mitigation: Pre-processing (Re-weighting), In-processing (Constraints), and Post-processing
- Auditing black-box models for disparate impact
- Ethical implications of automated decision-making systems

###### Topic: Privacy & Explainability

- Differential Privacy in analytical queries and model training
- Explainable AI (XAI) for high-stakes decisions (SHAP, LIME, Integrated Gradients)
- Model Cards and Data Sheets for transparency
- Regulatory compliance (GDPR, EU AI Act) from a Data Science perspective

#### SKILL: Strategic Decision Intelligence

`Tier: 4T` | `Roles: DS` | **Max Level: 5** | **Prerequisites: Advanced Causal Inference Lv 8, Mathematical Optimization Lv 8, Technical Communication Lv 5**

###### Topic: Decision Strategy & Policy

- Counterfactual Policy Evaluation (Off-policy evaluation)
- Multi-objective Optimization and Pareto Frontier analysis for business trade-offs
- Simulation & Digital Twins for long-term strategic forecasting
- Mechanism Design and Auction Theory for Marketplaces

###### Topic: Influence & Leadership

- Mentoring Staff DS on experimental rigor
- Defining the "North Star" metric hierarchy for organizations
- Identifying and quantifying "Product-Market-Algorithm" fit
- Driving the adoption of scientific evidence in executive decision-making

#### SKILL: Advanced DS Research

`Tier: 4T` | `Roles: DS`

###### Topic: Cross-domain Research

- Causal inference + ML unification
- Bayesian nonparametrics
- Decision theory + causal inference integration

#### SKILL: Cross-path Master

`Tier: 4T` | `Roles: MLE, DS, AIE`

###### Topic: MLE + DS Convergence

- Causal ML systems in production (MLE + DS)
- Probabilistic ML serving (MLE + DS)
- Research-grade A/B testing infrastructure (MLE + DS)
- Cross-path mentorship & knowledge transfer

## Data Engineer (DE)

### Tier F

#### SKILL: Statistics

`Tier: F` | `Roles: MLE, DS, DE`

###### Topic: Descriptive Statistics

- Central tendency & spread (mean, variance, std, IQR)
- Frequency measures
- Skewness & kurtosis
- Normality tests (Shapiro-Wilk, Q-Q plots)
- Linear & non-linear relationships (Pearson, Spearman)
- Independent & dependent variables
- Variable types (continuous, categorical, ordinal)
- Relationship direction & strength
- Visualization literacy

###### Topic: Probability

- Continuous vs discrete functions
- Random variables & distributions
- Discrete: Binomial, Poisson, Geometric
- Continuous: Uniform, Exponential, Beta, Normal
- Gaussian / normal distribution
- Bayes' theorem
- Conditional probability mechanics
- Prior, likelihood, posterior intro
- Expectation & variance

###### Topic: Inferential Statistics

- Hypothesis testing (Null vs Alternative)
- Type I & II errors (power, alpha, beta)
- Central Limit Theorem
- Why CLT enables parametric testing
- When CLT breaks (heavy tails, small n)
- t-Test & z-Test (one-sample, two-sample, paired)
- p-value interpretation & misinterpretation
- Confidence intervals & bootstrap CI
- Regression & residuals (R², adjusted R², F-statistic)
- One-way & two-way ANOVA
- Chi-square test
- Goodness of fit
- Homoscedasticity tests (Breusch-Pagan, Levene)
- Multiple comparisons
- Permutation tests ← NEW
- Bootstrap hypothesis testing ← NEW

###### Topic: Bayesian Statistics Intro ← NEW topic

- Thinking like a Bayesian (prior beliefs updated by evidence)
- Prior & posterior distributions
- Conjugate priors (Beta-Binomial, Normal-Normal)
- Bayesian credible intervals vs frequentist CI
- When Bayesian vs frequentist approach makes sense
- Bridge to full Bayesian ML skill (Senior tier)

###### Topic: Statistical Learning Theory

- Bias-variance tradeoff
- Sample size & statistical power
- Effect size (Cohen's d, η²), power analysis (1-β), MDE
- MLE & MAP
- Cross-validation
- Information criteria (AIC/BIC)
- Survival analysis (Kaplan-Meier, Cox PH, time-to-event features)

#### SKILL: Discrete Mathematics

`Tier: F` | `Roles: MLE, DE`

###### Topic: Set Theory & Logic

- Sets, subsets, power sets
- Set operations (union, intersection, complement)
- Propositional & predicate logic
- Proof techniques (direct, contradiction, induction)

###### Topic: Combinatorics & Counting

- Permutations & combinations
- Pigeonhole principle
- Inclusion-exclusion
- Applications in feature space counting

###### Topic: Graph Theory ← canonical DAG home

- Graph definitions & types (directed, undirected, weighted)
- DAGs — definition, properties, canonical prerequisite node
- Graph representations (adjacency matrix vs list)
- Connectivity, paths, cycles, bipartite graphs
- Topological ordering & critical path
- Reachability & transitive closure
- Cross-ref: DSA → Graph Structures & Algorithms

###### Topic: Number Theory & Modular Arithmetic

- Divisibility & primes
- Modular arithmetic, GCD, Euclidean algorithm
- Applications in hashing & cryptography

###### Topic: Relations & Functions

- Relations (reflexive, symmetric, transitive)
- Equivalence classes & partitions
- Functions (injective, surjective, bijective)

#### SKILL: Python

`Tier: F` | `Roles: MLE, DS, DE, AIE`

###### Topic: Core Language

- Python syntax & logic (variables, control flow, functions, scope, error handling)
- Data Structures (lists, dicts, sets, tuples, comprehensions)

###### Topic: OOP

- Classes & inheritance
- Dunder methods
- Dataclasses & ABCs
- Mixins & composition

###### Topic: Functional Patterns

- Lambdas & decorators
- map / filter / reduce
- Closures
- Itertools

###### Topic: Generators & Memory

- Generator expressions & yield
- Lazy evaluation mechanics
- Memory-efficient data streams

###### Topic: Modules & Packaging ← NEW topic

- Module system (imports, **init**.py, **all**)
- Package structure for ML projects
- virtualenv, Pip, requirements.txt
- pyproject.toml & build backends
- Namespace packages
- Publishing to PyPI basics

###### Topic: Typing & Linting

- Type hints
- Pydantic schemas & validation
- mypy, pyright static analysis
- Linting tools (Black, Flake8, isort, Ruff)
- IDE integration (VSCode, DataSpell, Jupyter)

###### Topic: Concurrency

- AsyncIO fundamentals, async/await
- Threading vs multiprocessing
- Locks & queues
- Use cases: streaming, training, deployment

###### Topic: Performance & Debugging

- Memory profiling (Memray), performance tracing (Viztracer)
- Vectorization (numpy, pandas, numba)
- timeit, cProfile, memory_profiler
- Common bottleneck patterns in ML code

###### Topic: Python Libraries

- Data Analysis: pandas, numpy
- Numerical & Scientific: scipy, statsmodels
- Visualization: matplotlib, seaborn, plotly
- ML Toolkits: scikit-learn, XGBoost
- DL Toolkits: PyTorch, TensorFlow
- PEP8, docstrings, clean code standards

#### SKILL: SQL

`Tier: F` | `Roles: MLE, DS, DE, AIE`

###### Topic: Foundations

- DDL (CREATE, ALTER, DROP)
- DML (SELECT, INSERT, UPDATE, DELETE)
- Filtering, sorting, GROUP BY, HAVING

###### Topic: Joins & Set Operations

- INNER / LEFT / RIGHT / FULL joins
- Self-joins
- UNION / INTERSECT / EXCEPT
- Subqueries & CTEs

###### Topic: Window Functions

- ROW_NUMBER, RANK, DENSE_RANK
- LAG / LEAD (time-series patterns)
- Running totals & moving averages
- PARTITION BY semantics
- Sessionization patterns (30-min gaps)

###### Topic: Performance & Design

- Query execution plans
- Indexing strategies
- Query optimization patterns
- Normalization & schema design (Star, Snowflake)
- Transactions & ACID / isolation levels

###### Topic: Cloud Query Engines

- AWS Athena (serverless SQL on S3)
- BigQuery (slots, columnar, partitioning)
- Snowflake (semi-structured data, VARIANT type)
- Redshift patterns

#### SKILL: DSA

`Tier: F` | `Roles: MLE, DS, DE`

###### Topic: Core Data Structures

- Arrays, linked lists, stacks, queues
- Hash maps & collision strategies
- Trees (BST, AVL, Red-Black)
- Heaps & priority queues

###### Topic: Graph Structures & Algorithms

- Representation (adjacency list/matrix)
- BFS & DFS
- Shortest paths (Dijkstra, Bellman-Ford)
- Topological sort & SCC
- DAG prerequisite: Discrete Math → Graph Theory

###### Topic: Algorithm Design Patterns

- Two pointers & sliding window
- Divide & conquer
- Dynamic programming (memoization vs tabulation)
- Greedy & backtracking
- Recursion, sorting, search
- Bit manipulation ← NEW
- Segment trees & Binary Indexed Trees (FAANG) ← NEW

###### Topic: Complexity Analysis

- Big-O, Big-Θ, Big-Ω
- Time vs space tradeoffs
- Amortized analysis
- NP-completeness basics

#### SKILL: Systems Fundamentals

`Tier: F` | `Roles: MLE, DE`

###### Topic: Memory Architecture

- Stack vs heap
- Virtual memory & address space
- Memory layout (code, data, BSS, heap, stack)
- Cache hierarchy (L1/L2/L3, locality)

###### Topic: Concurrency & Synchronization

- Threads vs processes
- Race conditions & data races
- Mutex, semaphore, spinlock
- Deadlock, livelock, starvation

###### Topic: Memory Management

- Manual allocation (malloc/free, new/delete)
- Garbage collection strategies
- Ownership models (Rust borrow checker)
- Memory leaks & tools (Valgrind, AddressSanitizer)

###### Topic: I/O & System Calls

- File descriptors & buffering
- Blocking vs non-blocking I/O
- System calls (read, write, mmap)
- Signals & process management

### Tier 1

#### SKILL: NoSQL Databases

`Tier: 1T` | `Roles: DE, MLE`

###### Topic: Key-Value & Caching

- DynamoDB (fast lookups, single-table design)
- Redis (caching, pub-sub, TTL patterns)
- When to use key-value vs relational

###### Topic: Document Stores

- MongoDB (flexible schema, aggregation pipeline)
- Couchbase
- Semi-structured data patterns

###### Topic: Column Stores

- Cassandra (wide tables, write-optimized)
- HBase
- Time-series workloads on column stores

###### Topic: Search Engines

- Elasticsearch (inverted index, query DSL)
- Log analytics patterns
- Search & scoring relevance

###### Topic: Graph Databases

- Neo4j (Cypher, graph traversal)
- Graph DB use cases in fraud & RecSys
- Cross-ref: Discrete Math → Graph Theory

#### SKILL: Data Engineering

`Tier: 1T` | `Roles: DE, MLE, DS`

###### Topic: Data Warehouse & Lakehouse

- OLTP vs OLAP design principles
- Snowflake (virtual warehouses, Snowpark, cost management, semi-structured data)
- Databricks & Delta Lake (Spark, ACID, Z-ordering, Unity Catalog)
- BigQuery (slots, columnar, partitioning, BigQuery ML)
- Redshift & S3/HDFS data lakes
- Lakehouse patterns (Bronze/Silver/Gold)

###### Topic: Data Modeling ← NEW standalone topic

- Dimensional modeling fundamentals (Kimball methodology)
- Star schema design (fact tables, dimension tables)
- Snowflake schema (normalized dimensions)
- Data Vault methodology (hubs, links, satellites)
- Slowly Changing Dimensions (SCD Types 1, 2, 3, 4)
- Normalization vs denormalization trade-offs
- Schema evolution & backward compatibility

###### Topic: Data Ingestion & ETL

- Batch ingestion patterns
- ETL vs ELT paradigm shift
- Change data capture (CDC)
- Schema evolution & data contracts
- AWS Glue (Crawlers, Jobs, Catalog)
- File formats (CSV, JSON, Parquet, Avro, ORC)

###### Topic: Data Transformation

- dbt core (models, sources, macros, tests, lineage)
- SQL transformation patterns
- Incremental models & SCD types
- Data quality (Great Expectations, Deequ)

###### Topic: Streaming Data

- Kafka (topics, partitions, consumers, KSQL, Kafka Connect)
- Spark (RDDs, DataFrames, SparkSQL, Catalyst, MLlib)
- Flink (stateful ops, windowing, event time, late data)
- Streaming vs micro-batch semantics

###### Topic: Pipeline Orchestration

- Airflow (DAG anatomy, TaskFlow API, XComs, K8s operator)
- Prefect & modern orchestration alternatives
- Pipeline design patterns (idempotency, backfill)
- Data lineage & observability
- Workflow versioning (GitOps, DVC)

###### Topic: Metadata Management ← NEW topic

- Data catalog concepts (discoverability, ownership)
- OpenMetadata, Apache Atlas, DataHub
- Data lineage graph design
- Data contracts & schema registry
- Column-level lineage
- Data governance frameworks

##### SKILL: Lakehouse & Modern Data Warehousing

`Tier: 1T` | `Roles: DE`
####### Topic: Cloud Data Warehouses

- Snowflake architecture (Virtual Warehouses, Micro-partitions)
- BigQuery slots and columnar storage mechanics
- Redshift sort and distribution keys
####### Topic: Lakehouse Formats
- Apache Iceberg internals (metadata tree, manifest files)
- Delta Lake (ACID transactions on object storage)
- Apache Hudi (upserts and incremental processing)

O#### SKILL: Software Engineering for ML
`Tier: 1T` | `Roles: MLE, DS, DE, AIE`

###### Topic: Version Control

- Git fundamentals (add, commit, branching, core commands)
- Conventional Commits spec
- Trunk-based development & GitFlow
- GitHub workflows (fork, PR, issues, milestones)
- First open-source contribution
- Git for data & model versioning (DVC)
- GitOps & CI pipeline triggers

###### Topic: Testing

- Unit testing (pytest) — fixtures, parametrize, mocking
- Integration testing — pipeline, API contract, E2E
- ML-specific testing (model behavior, data validation, performance regression, shadow mode)
- Test-Driven Development for ML

###### Topic: Environment Management

- Virtual environments (pyenv, venv)
- Dependency management (Poetry, pip-tools)
- Docker for ML (Dockerfile, Docker Compose, multi-stage, GPU passthrough)
- Reproducibility patterns (lock files, env-as-code)

###### Topic: CI/CD

- GitHub Actions (workflows, matrix builds, secrets, reusable)
- GitLab CI patterns
- Pre-commit hooks & linting
- Automated test gates
- Deployment pipelines

###### Topic: Code Quality

- Code reviews (ML code checklist, PR hygiene, notebooks vs modules)
- Refactoring ML code (notebook → module)
- Type hints, PEP8, docstrings
- Code smell detection in DS workflows

#### SKILL: Dev Principles

`Tier: 1T` | `Roles: MLE, DE, AIE`

###### Topic: Clean Code Principles

- SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
- DRY (Don't Repeat Yourself) — including in ML pipelines
- KISS & YAGNI
- Code smell detection (long methods, feature envy, data clumps)

###### Topic: Design Patterns

- Creational (Factory, Builder, Singleton)
- Structural (Adapter, Decorator, Facade)
- Behavioral (Strategy, Observer, Template Method)
- Patterns in ML pipeline construction

###### Topic: Software Architecture

- Layered Architecture (Controller, Service, Gateway) applied to ML serving
- Hexagonal Architecture (Ports & Adapters)
- Event-driven architecture basics (cross-ref Kafka)
- Architecture Decision Records (ADRs)

###### Topic: Refactoring

- Extract method, extract class
- Notebook → module refactoring
- Incremental refactoring with test coverage

#### SKILL: Dev Principles

`Tier: 1T` | `Roles: MLE, DE, AIE`

###### Topic: Clean Code Principles

- SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion)
- DRY (Don't Repeat Yourself) — including in ML pipelines
- KISS & YAGNI
- Code smell detection (long methods, feature envy, data clumps)

###### Topic: Design Patterns

- Creational (Factory, Builder, Singleton)
- Structural (Adapter, Decorator, Facade)
- Behavioral (Strategy, Observer, Template Method)
- Patterns in ML pipeline construction

###### Topic: Software Architecture

- Layered Architecture (Controller, Service, Gateway) applied to ML serving
- Hexagonal Architecture (Ports & Adapters)
- Event-driven architecture basics (cross-ref Kafka)
- Architecture Decision Records (ADRs)

###### Topic: Refactoring

- Extract method, extract class
- Notebook → module refactoring
- Incremental refactoring with test coverage

### Tier 2

#### SKILL: Kubernetes

`Tier: 2T` | `Roles: MLE, DE`

###### Topic: Core Primitives

- Pods, ReplicaSets, Deployments
- Services & Ingress
- ConfigMaps & Secrets
- Namespaces

###### Topic: Storage & Networking

- PersistentVolumes & Claims, StorageClasses
- Network policies
- DNS within cluster

###### Topic: Operations

- kubectl patterns
- Rolling updates & rollbacks
- Resource limits & autoscaling (HPA, VPA)
- Health checks & probes

###### Topic: Ecosystem

- Helm charts
- RBAC & service accounts
- Monitoring (Prometheus / Grafana)
- K8s for ML workloads (KubeFlow basics)

#### SKILL: Streaming Architectures

`Tier: 2T` | `Roles: DE, MLE`

###### Topic: Event Streaming

- Apache Kafka architecture (Brokers, Topics, Partitions)
- Consumer groups and offset management#### SKILL: Linear Algebra
`Tier: F` | `Roles: MLE, DS`

###### Topic: Vectors & Spaces

- Vector operations, dot & cross product
- Linear independence & span
- Basis & change of basis
- Vector spaces & subspaces

###### Topic: Matrix Operations

- Matrix multiplication & transpose
- Element-wise vs matrix operations
- Broadcasting mechanics
- Batch operations (tensors as generalized matrices)
- Inverse & determinant
- Systems of linear equations (Gaussian elimination)
- LU, QR decompositions

###### Topic: Eigenstructure

- Eigenvalues & eigenvectors
- Geometric interpretation
- Characteristic polynomial
- Power iteration method
- Diagonalization
- Why diagonalization simplifies computation
- Application in PCA & covariance matrices
- SVD (Singular Value Decomposition)
- PCA from SVD

###### Topic: ML Applications

- Matrix form of linear regression
- Attention as matrix operations
- Covariance matrices
- Tensor operations & broadcasting
- Exactly-once semantics (EOS)

###### Topic: Stream Processing

- Apache Flink state management and checkpoints
- Spark Structured Streaming
- Event-time vs Processing-time & Watermarks

### Tier 2.5

#### SKILL: System Design for ML

`Tier: 2.5T` | `Roles: MLE, DE, AIE`

###### Topic: Scalable Data Architecture

- Load balancing & sharding
- CAP theorem & distributed systems tradeoffs
- Horizontal vs vertical scaling
- Partitioning strategies for ML data

###### Topic: ML System Architectures

- Real-time vs batch serving patterns
- Request/response vs queue-based inference
- Two-tower architectures (RecSys)
- Feature pipeline design (online vs offline)

###### Topic: Data Systems Design ← NEW topic

- OLTP vs OLAP for ML workloads
- Event sourcing & CQRS pattern
- Lambda architecture (batch + stream)
- Kappa architecture (stream only)
- Data mesh principles
- Stream processing vs micro-batch trade-offs

###### Topic: ML Platform Architecture ← NEW topic

- Self-serve ML platform design
- Internal tooling (experiment tracking, feature store, model registry)
- Platform abstraction layers
- Multi-tenancy in ML platforms
- Compute scheduling (Kubernetes, Ray)
- Cost attribution & showback

###### Topic: ML at Scale

- Large-scale model training (distributed strategies)
- Large-scale serving (autoscaling, latency budgets)
- Multi-model serving
- A/B testing infrastructure at scale

###### Topic: Reliability & Operations

- SLA/SLO/SLI for ML systems
- Circuit breakers & fallback strategies
- Disaster recovery for ML systems
- Cost optimization patterns

### Tier 3

### Tier 4

## Artificial Intelligence Engineer (AIE)

### Tier F

#### SKILL: Python

`Tier: F` | `Roles: MLE, DS, DE, AIE`

###### Topic: Core Language

- Python syntax & logic (variables, control flow, functions, scope, error handling)
- Data Structures (lists, dicts, sets, tuples, comprehensions)

###### Topic: OOP

- Classes & inheritance
- Dunder methods
- Dataclasses & ABCs
- Mixins & composition

###### Topic: Functional Patterns

- Lambdas & decorators
- map / filter / reduce
- Closures
- Itertools

###### Topic: Generators & Memory

- Generator expressions & yield
- Lazy evaluation mechanics
- Memory-efficient data streams

###### Topic: Modules & Packaging ← NEW topic

- Module system (imports, **init**.py, **all**)
- Package structure for ML projects
- virtualenv, Pip, requirements.txt
- pyproject.toml & build backends
- Namespace packages
- Publishing to PyPI basics

###### Topic: Typing & Linting

- Type hints
- Pydantic schemas & validation
- mypy, pyright static analysis
- Linting tools (Black, Flake8, isort, Ruff)
- IDE integration (VSCode, DataSpell, Jupyter)

###### Topic: Concurrency

- AsyncIO fundamentals, async/await
- Threading vs multiprocessing
- Locks & queues
- Use cases: streaming, training, deployment

###### Topic: Performance & Debugging

- Memory profiling (Memray), performance tracing (Viztracer)
- Vectorization (numpy, pandas, numba)
- timeit, cProfile, memory_profiler
- Common bottleneck patterns in ML code

###### Topic: Python Libraries

- Data Analysis: pandas, numpy
- Numerical & Scientific: scipy, statsmodels
- Visualization: matplotlib, seaborn, plotly
- ML Toolkits: scikit-learn, XGBoost
- DL Toolkits: PyTorch, TensorFlow
- PEP8, docstrings, clean code standards

#### SKILL: SQL

`Tier: F` | `Roles: MLE, DS, DE, AIE`

###### Topic: Foundations

- DDL (CREATE, ALTER, DROP)
- DML (SELECT, INSERT, UPDATE, DELETE)
- Filtering, sorting, GROUP BY, HAVING

###### Topic: Joins & Set Operations

- INNER / LEFT / RIGHT / FULL joins
- Self-joins
- UNION / INTERSECT / EXCEPT
- Subqueries & CTEs

###### Topic: Window Functions

- ROW_NUMBER, RANK, DENSE_RANK
- LAG / LEAD (time-series patterns)
- Running totals & moving averages
- PARTITION BY semantics
- Sessionization patterns (30-min gaps)

###### Topic: Performance & Design

- Query execution plans
- Indexing strategies
- Query optimization patterns
- Normalization & schema design (Star, Snowflake)
- Transactions & ACID / isolation levels

###### Topic: Cloud Query Engines

- AWS Athena (serverless SQL on S3)
- BigQuery (slots, columnar, partitioning)
- Snowflake (semi-structured data, VARIANT type)
- Redshift patterns

### Tier 1

#### SKILL: Technical Communication

`Tier: 1T` | `Roles: MLE, DS, AIE`

###### Topic: ML Communication

- Explaining ML concepts to non-technical stakeholders
- Visual design for ML results
- Slide preparation for ML projects
- Writing ML system design documents (ADRs)

###### Topic: Interview Readiness

- Coding & ML interviews (Python, SQL, ML models)
- DS + ML system design interviews
- Live coding preparation (LeetCode, Interview Query)

#### SKILL: Machine Learning Classical

`Tier: 1T` | `Roles: MLE, DS, AIE`

###### Topic: Statistical Foundations

- Statistical & foundational techniques in ML
- Role of statistics in ML
- Parametric vs non-parametric methods
- Assumptions underlying ML models
- Independent & dependent variables in ML context
- Features (X) vs target (y) framing
- Variable selection principles
- Defining models (function approximation framing)
- Model capacity & inductive bias
- Hypothesis class & complexity

###### Topic: Learning Paradigms

- Labeled data (what makes data labeled, label quality, annotation strategies)
- Supervised learning (learning from (X,y) pairs, generalization goal)
- Unsupervised learning (learning from X only, structure discovery)
- Semi-supervised learning
- When labels are scarce
- Self-training, co-training, pseudo-labeling
- Label propagation
- Self-supervised learning
- Pretext tasks (rotation, colorization, jigsaw)
- Contrastive learning (SimCLR, MoCo)
- Masked autoencoders
- Relation to foundation models
- Reinforcement learning intro (cross-ref RL skill)

###### Topic: Supervised Learning

- Linear regression (OLS, assumptions, coefficient interpretation)
- Logistic regression (odds ratio, log-odds, decision boundary)
- Naive Bayes
- Decision trees
- SVMs (cross-ref Math Optimization → Convex QP)
- Ridge & Lasso regression (L1 vs L2 regularization mechanics)
- kNN
- Gradient Boosting: XGBoost, LightGBM

###### Topic: Regularization

- Why regularization? (overfitting prevention)
- L1 (Lasso) — sparsity inducing
- L2 (Ridge) — weight shrinkage
- Elastic Net (L1 + L2 combination)
- Dropout (cross-ref Deep Learning)
- Early stopping
- Data augmentation as regularization
- Bayesian interpretation of regularization

###### Topic: Unsupervised Learning

- k-means & DBSCAN
- Hierarchical clustering
- PCA & dimensionality reduction / LDA
- Gaussian mixture models
- Anomaly detection

###### Topic: Ensemble Methods

- Bagging & random forests
- Boosting (XGBoost, LightGBM)
- Stacking & feature importance

###### Topic: Model Evaluation

- Defining train/test set splits
- Hold-out split rationale, train/val/test distinction
- Data leakage prevention, stratified splitting
- Model underfitting & overfitting
- Diagnosing with learning curves, bias-variance decomposition
- Model selection (hyperparameter tuning, cross-validation, AIC/BIC)
- Metrics — classification (Accuracy, Precision, Recall, F1, ROC-AUC, Log Loss)
- Metrics — regression (MAE, RMSE, R², MAPE)
- Trade-offs in evaluation metrics
- Precision-recall tradeoff, sensitivity vs specificity
- Business metric alignment
- When accuracy is misleading (imbalanced classes)
- Additional offline evaluation methods
- Backtesting, temporal validation, simulation-based, counterfactual
- K-Fold cross-validation, calibration

###### Topic: Feature Engineering

- Encoding strategies (ordinal, target, one-hot, embeddings)
- Target encoding leakage prevention ← NEW
- Embeddings for categorical features (entity embeddings) ← NEW
- Numerical transformations (scaling, binning, interactions)
- Handling missing data (imputation strategies)
- Feature selection (filter, wrapper, embedded methods)
- Feature stores & reuse patterns

###### Topic: scikit-learn

- Estimator API & pipeline objects
- ColumnTransformer & preprocessing pipelines
- Custom transformers & estimators
- Model persistence & versioning

###### Topic: Recommender Systems

- Problem framing (collaborative, content-based, hybrid)
- Explicit & implicit ratings
- Explicit: star ratings, reviews
- Implicit: clicks, views, purchases
- Confidence weighting for implicit feedback
- Collaborative filtering (user-based, item-based, scalability challenges)
- Content-based filtering (TF-IDF & embedding-based, feature representation)
- User-based/item-based vs content-based comparison
- Cold start problem per method
- Matrix factorization (SVD, ALS, iALS for implicit)
- Two-tower retrieval models ← NEW
- User tower & item tower architecture
- Approximate nearest neighbor at inference
- Learning to Rank (LTR) ← NEW topic
- Pointwise (regression on relevance)
- Pairwise (RankNet, LambdaRank)
- Listwise (LambdaMART, SoftmaxNDCG)
- Session-based recommendation ← NEW
- Sequential patterns & recency bias
- RNN/Transformer-based session models
- Knowledge graph embeddings for RecSys ← NEW
- TransE, RotatE, KGE for item enrichment
- Entity linking and graph traversal for recommendations
- Neural models (Autoencoders, Neural CF)
- Evaluation (NDCG, MAP, hit rate)

---

#### SKILL: ML Project Lifecycle

`Tier: 1T` | `Roles: MLE, DS, AIE`

###### Topic: Defining an ML Problem

- Business problem → ML problem translation
- Is ML the right solution?
- Scoping & success metrics
- Stakeholder alignment (defining ground truth, performance baselines, ROI)
- Problem types taxonomy (classification, regression, ranking, generation)
- Online vs offline prediction, batch vs real-time

###### Topic: Data Acquisition

- Data source identification (internal DBs, third-party, scraping, APIs)
- Synthetic data generation (cross-ref Gen AI)
- Active learning (query by committee, uncertainty sampling)
- Crowdsourcing & labeling pipelines, data flywheel
- Data quality assessment (completeness, consistency, sampling bias)
- Schema validation (Great Expectations)

###### Topic: Exploratory Data Analysis

- EDA in the ML lifecycle context
- Hypothesis generation from data
- Feature-target relationship analysis
- Data distribution shifts (train vs production)
- Multicollinearity detection

###### Topic: Model Training

- Training pipeline anatomy
- Data loading & batching
- Forward pass, loss computation, backpropagation & parameter update
- Epoch, iteration, step definitions
- Experiment management (reproducibility, hyperparameter search, cost management)
- Iterative improvement loop (error analysis, augmentation decisions)

###### Topic: Model Evaluation (Lifecycle)

- Offline vs online evaluation distinction
- A/B testing for model evaluation
- Shadow mode evaluation
- Evaluation on subgroups (slicing)
- Trade-offs in evaluation metrics (business vs technical)
- Backtesting pipelines, counterfactual evaluation, simulation

###### Topic: End-to-End Machine Learning

- Full pipeline: data → model → serving → monitoring
- ML system components map
- From notebook to production path
- Feature pipeline design (online vs offline)
- Model versioning (model cards, semantic versioning, rollback)
- Common failure modes in production ML

###### Topic: Deployment Environments

- Cloud environments (AWS, GCP, Azure trade-offs, managed vs self-hosted, cost)
- Local environments (Docker for local parity, GPU setup, dev→staging→prod)
- On-device / edge ML
- When on-device makes sense (latency, privacy, offline)
- TF Lite, ONNX Runtime, Core ML
- Model compression for edge (quantization, pruning)
- Android/iOS deployment patterns
- Federated learning basics

#### SKILL: Software Engineering for ML

`Tier: 1T` | `Roles: MLE, DS, DE, AIE`

###### Topic: Version Control

- Git fundamentals (add, commit, branching, core commands)
- Conventional Commits spec
- Trunk-based development & GitFlow
- GitHub workflows (fork, PR, issues, milestones)
- First open-source contribution
- Git for data & model versioning (DVC)
- GitOps & CI pipeline triggers

###### Topic: Testing

- Unit testing (pytest) — fixtures, parametrize, mocking
- Integration testing — pipeline, API contract, E2E
- ML-specific testing (model behavior, data validation, performance regression, shadow mode)
- Test-Driven Development for ML

###### Topic: Environment Management

- Virtual environments (pyenv, venv)
- Dependency management (Poetry, pip-tools)
- Docker for ML (Dockerfile, Docker Compose, multi-stage, GPU passthrough)
- Reproducibility patterns (lock files, env-as-code)

###### Topic: CI/CD

- GitHub Actions (workflows, matrix builds, secrets, reusable)
- GitLab CI patterns
- Pre-commit hooks & linting
- Automated test gates
- Deployment pipelines

###### Topic: Code Quality

- Code reviews (ML code checklist, PR hygiene, notebooks vs modules)
- Refactoring ML code (notebook → module)
- Type hints, PEP8, docstrings
- Code smell detection in DS workflows

#### SKILL: Mathematical Optimization

`Tier: 1T` | `Roles: MLE, AIE`

###### Topic: Foundations

- Objective function, constraints, feasible region
- Local vs global optima
- Convex vs non-convex problems
- Duality (Lagrangian, KKT, primal/dual, strong/weak)

###### Topic: Linear Programming

- LP formulation & standard form
- Simplex method mechanics
- Sensitivity analysis & shadow prices
- LP in ML (L1 regularization as LP, basis pursuit)

###### Topic: Convex Optimization

- QP, QCQP, SOCP, SDP hierarchy
- SVM as a QP problem
- Interior point methods
- Tooling (CVXPY, SCS, MOSEK)

###### Topic: Non-convex & Combinatorial

- Integer programming (ILP, MIP)
- Branch & bound basics
- Heuristics (simulated annealing, genetic algorithms)

###### Topic: ML Applications

- Neural network training as non-convex optimization
- Hyperparameter optimization (BO, CMA-ES)
- Optimal transport & Wasserstein distance
- Policy gradient as optimization

### Tier 2

#### SKILL: Computer Vision

`Tier: 2T` | `Roles: MLE, AIE, DS`

###### Topic: Classical CV

- Image representation (pixels, channels, histograms)
- Filtering & convolution (Gaussian, Sobel, Laplacian)
- Feature detection (SIFT, ORB, Harris corners)
- Traditional pipelines (HOG + SVM, watershed)

###### Topic: Deep CV — Classification

- CNN architecture patterns (VGG, ResNet, EfficientNet)
- Transfer learning & fine-tuning
- Common image datasets (ImageNet, CIFAR-10/100, COCO, Open Images)
- Data augmentation strategies
- Evaluation (top-k accuracy, confusion matrix)

###### Topic: Deep CV — Detection & Segmentation

- Anchor-based detection (YOLO, Faster R-CNN)
- Semantic vs instance segmentation (U-Net, Mask R-CNN)
- mAP & IoU metrics
- Panoptic segmentation

###### Topic: Generative Models in CV

- GANs for image generation (StyleGAN, DCGAN, CycleGAN, Conditional GANs)
- Diffusion models (DDPM, Stable Diffusion)
- VAEs for vision

###### Topic: Self-supervised CV ← NEW topic

- DINO & DINOv2 (self-distillation for visual features)
- MAE for vision (masked image modeling)
- CLIP pretraining (cross-ref Gen AI → Multimodal)
- Contrastive learning in vision (MoCo, SimCLR)
- Downstream task transfer from self-supervised features

###### Topic: OCR & Document Understanding

- Classical OCR (Tesseract, preprocessing)
- Deep learning OCR (CRNN, attention-based)
- Layout analysis & document parsing
- Production OCR pipelines
- AWS Textract

###### Topic: Advanced Topics

- Vision Transformers (ViT, DINO)
- Multimodal models (CLIP, Flamingo)
- 3D vision & depth estimation
- Video understanding basics
- Neural Radiance Fields (NeRF) ← NEW
- Segment Anything Model (SAM) ← NEW

#### SKILL: NLP

`Tier: 2T` | `Roles: MLE, DS, AIE`

###### Topic: NLP Foundations

- Text as sequence of symbols vs continuous data
- Ambiguity: lexical, syntactic, semantic, pragmatic
- Curse of dimensionality in text
- Language as probability distributions over sequences
- Morphology, syntax, semantics, pragmatics
- Constituency & dependency parsing
- Coreference resolution ← NEW explicit
- NLP task taxonomy (classification, generation, extraction, translation)
- Discriminative vs generative NLP models
- NLP pipeline vs end-to-end models

###### Topic: Text Preprocessing

- Tokenization (rule-based, BPE, WordPiece)
- Normalization (lowercasing, stemming, lemmatization)
- Stop word removal & noise cleaning
- Handling unstructured text (encoding, HTML, unicode)
- Feature extraction (TF-IDF, BoW, n-grams)

###### Topic: Classical NLP

- Text classification pipeline end-to-end
- Sentiment analysis (lexicon vs ML-based)
- Named Entity Recognition (NER) (rule-based, CRF-based, entity-level F1)
- Topic modeling (LDA, NMF, coherence score)
- Building a text classifier
- Information extraction patterns
- Relation extraction ← NEW

###### Topic: Neural NLP

- Word embeddings (Word2Vec, GloVe, FastText)
- RNN, LSTM for NLP (seq2seq, language modeling, bidirectional)
- Language modeling & perplexity
- Transfer learning in NLP (fine-tuning BERT)
- Structured output (JSON, Tables, Markdown)

###### Topic: BERT Models

- BERT architecture (bidirectional encoder, MLM + NSP)
- WordPiece tokenization, [CLS] & [SEP] tokens
- BERT variants (RoBERTa, ALBERT, DistilBERT)
- Fine-tuning BERT (classification, NER, QA)
- Task-specific heads
- When to use BERT vs generative models

###### Topic: GPT & Generative NLP Models

- GPT architecture (autoregressive / causal LM, decoder-only)
- GPT variants (GPT-2, GPT-3, GPT-4 family)
- Open-source alternatives (LLaMA, Mistral)
- Prompting as an NLP technique

###### Topic: Multilingual & Cross-lingual NLP ← NEW topic

- Multilingual BERT (mBERT) & XLM-RoBERTa
- Cross-lingual transfer learning
- Language detection
- Zero-shot & few-shot cross-lingual transfer
- Multilingual tokenization strategies
- Low-resource language challenges

###### Topic: Document Understanding ← NEW topic

- Layout-aware models (LayoutLM, LayoutLMv3)
- Multi-page document processing
- Table extraction from documents
- Form understanding & key-value extraction
- Document Q&A
- Cross-ref: Computer Vision → OCR

###### Topic: NLP Evaluation

- BLEU score (machine translation)
- ROUGE score (summarization)
- Perplexity (language models)
- Entity-level F1 (NER)
- Human evaluation patterns

###### Topic: Speech

- Speech recognition pipeline (acoustic + language model)
- MFCC, Spectrograms (audio features)
- ASR evaluation (WER, CER)
- AWS Transcribe, Whisper patterns
- End-to-end ASR (DeepSpeech)

###### Topic: Dialogue Systems

- Chatbots & conversational AI
- Dialog management (state tracking)
- LLM-powered dialog vs traditional NLU

#### SKILL: Graph Machine Learning

`Tier: 2T` | `Roles: MLE, DS, AIE`
**Prerequisites:** ML Classical L5, Deep Learning L5, Discrete Math L4

###### Topic: Graph Fundamentals for ML

- Graph representation for ML (node features, edge features, graph features)
- Homogeneous vs heterogeneous graphs
- Temporal graphs & dynamic graphs
- Graph sampling strategies
- Graph datasets (Cora, Citeseer, OGB benchmarks)

###### Topic: Graph Neural Networks (GNNs)

- Message passing framework (aggregate → combine → update)
- Graph Convolutional Networks (GCN)
- GraphSAGE (inductive learning, neighborhood sampling)
- Graph Attention Networks (GAT)
- Graph Isomorphism Network (GIN — most expressive GNN)
- Expressive power & Weisfeiler-Leman hierarchy

###### Topic: Advanced GNN Architectures

- Heterogeneous GNNs (R-GCN, HGT)
- Temporal GNNs (TGN, DyRep)
- Graph Transformers (Graphormer, GPS)
- Scalable GNNs (ClusterGCN, GraphSAINT)
- Over-smoothing & over-squashing problem

###### Topic: Graph Self-supervised Learning

- Link prediction pretraining
- Contrastive learning on graphs (GraphCL, GRACE)
- Graph autoencoders (GAE, VGAE)
- Cross-ref: Deep Learning → Self-supervised

###### Topic: GNN Applications

- Fraud detection on transaction graphs
- Molecular property prediction (drug discovery)
- Knowledge graph completion (TransE, RotatE)
- RecSys with graph structure (PinSage)
- Social network analysis

###### Topic: Evaluation & Tooling

- Node, edge, graph-level task metrics
- PyTorch Geometric (PyG)
- Deep Graph Library (DGL)
- OGB (Open Graph Benchmark)

#### SKILL: Deep Learning

`Tier: 2T` | `Roles: MLE, DS, AIE`

###### Topic: Neural Network Fundamentals

- Forward pass mechanics
- Activation functions (ReLU, GELU, sigmoid, tanh, SiLU)
- Backpropagation algorithm
- Weight initialization
- Gradient flow & vanishing gradients
- Perceptrons & MLP

###### Topic: Training Dynamics

- Optimizers (SGD, Adam, AdamW)
- Learning rate schedules (cosine, warmup, cyclical)
- Regularization (dropout, weight decay, L1/L2)
- Normalization techniques ← NEW subtopics
- Batch normalization
- Layer Normalization (used in Transformers)
- Group Normalization (CV with small batches)
- RMS Normalization (LLMs)
- Spectral Normalization (GANs)
- Gradient clipping ← NEW
- Overfitting/underfitting strategies
- Loss landscape visualization ← NEW

###### Topic: Architectures

- CNNs & convolution intuition (cross-ref Computer Vision)
- RNNs, LSTM, GRU
- LSTM mechanics (input, forget, output gates)
- Vanishing gradient problem & why LSTM solves it
- Bidirectional LSTMs
- Seq2seq with LSTMs
- Residual connections
- Attention mechanism (prereq for Gen AI)
- GANs (generator/discriminator, mode collapse, DCGAN, StyleGAN, FID/IS)
- Self-supervised learning in DL ← NEW topic
- Masked Autoencoders (MAE)
- DINO (distillation with no labels)
- BYOL, SimSiam (self-supervised without negatives)
- Relation to pretraining paradigm

###### Topic: Practical Training

- GPU training
- Mixed precision (FP16/BF16)
- Gradient accumulation
- Distributed training (DDP, FSDP)

###### Topic: Model Adaptation & Compression

- Transfer learning & fine-tuning
- Common image datasets (ImageNet, CIFAR, COCO, Open Images)
- Feature extraction vs full fine-tuning
- Domain adaptation strategies
- Knowledge distillation
- LoRA, adapters (PEFT)
- Quantization & pruning (GPTQ, QAT, GGUF)

###### Topic: Meta-learning & Hypernetworks ← NEW topic

- Few-shot learning problem framing
- MAML (Model-Agnostic Meta-Learning)
- Prototypical Networks
- Hypernetworks (networks that generate weights for other networks)
- Neural process basics

###### Topic: DL Frameworks

- PyTorch (tensor ops, autograd, nn.Module, DataLoader, DDP/FSDP, torch.compile)
- TensorFlow / Keras (sequential/functional API, tf.data, TF Lite)

#### SKILL: Model Serving & Optimization

`Tier: 2T` | `Roles: MLE, AIE`

###### Topic: Inference Engines

- Triton Inference Server architecture
- vLLM (PagedAttention, continuous batching)
- TensorRT optimizations

###### Topic: Model Compilation

- ONNX and ONNX Runtime
- TorchScript and JIT tracing
- Operator fusion and KV cache optimization

#### SKILL: Reinforcement Learning

`Tier: 2T` | `Roles: MLE, AIE`

###### Topic: RL Foundations

- Markov Decision Processes (MDPs)
- State, action, reward, policy, value function
- Exploration vs exploitation tradeoff
- Bellman equations
- Model-based vs model-free RL
- Model-based: learns environment dynamics; Model-free: learns policy/value directly
- Policy-based vs value-based
- Policy gradient methods; Q-learning, DQN; Actor-Critic

###### Topic: Classic RL Algorithms

- Q-Learning (tabular mechanics, Q-table update, convergence)
- SARSA (on-policy Q-learning)
- Deep Q-Networks (DQN) (experience replay, target network, Double/Dueling DQN)
- On-policy vs off-policy
- On-policy: SARSA, PPO; Off-policy: Q-learning, SAC
- Importance sampling for off-policy corrections

###### Topic: Advanced RL

- Policy Gradient methods (REINFORCE)
- Proximal Policy Optimization (PPO)
- Direct Preference Optimization (DPO)
- Soft Actor-Critic (SAC)
- Model-based RL (Dyna, world model basics)

###### Topic: Multi-agent RL ← NEW topic

- Cooperative vs competitive settings
- Centralized training, decentralized execution (CTDE)
- Nash equilibrium in multi-agent settings
- MARL frameworks (PettingZoo, RLlib multi-agent)
- Emergent communication & coordination

###### Topic: Safe RL ← NEW topic

- Constrained MDPs (safety constraints as budget)
- Constrained Policy Optimization (CPO)
- Lagrangian methods for safe RL
- Risk-sensitive RL (CVaR objectives)
- Safety in real-world deployment (conservative policies)

###### Topic: RL Applications in ML

- RLHF for LLM alignment
- Reward model training
- Bandits as lightweight RL (cross-ref Experimentation)
- RL for recommendation systems

#### SKILL: Explainable AI

`Tier: 2T` | `Roles: MLE, DS, AIE`|

###### Topic: Interpretability Foundations

- Interpretable vs explainable distinction
- Global vs local explanations
- Model-agnostic vs model-specific methods
- Faithfulness, stability, comprehensibility tradeoffs

###### Topic: Feature Attribution Methods

- SHAP (Shapley, TreeSHAP, KernelSHAP, DeepSHAP, NLP/CV)
- LIME (local surrogate, stability & fidelity limitations)
- Integrated Gradients
- Permutation importance

###### Topic: Model-specific Interpretability

- Linear model coefficients & confidence
- Decision tree & rule extraction
- Attention visualization (caveats — not explanation)
- Concept activation vectors (TCAV)

###### Topic: Applied XAI

- Regulatory context (EU AI Act, model cards)
- Fairness & bias auditing
- XAI in production (explanation APIs)
- Human-in-the-loop XAI workflows

### Tier 2.5

#### SKILL: System Design for ML

`Tier: 2.5T` | `Roles: MLE, DE, AIE`

###### Topic: Scalable Data Architecture

- Load balancing & sharding
- CAP theorem & distributed systems tradeoffs
- Horizontal vs vertical scaling
- Partitioning strategies for ML data

###### Topic: ML System Architectures

- Real-time vs batch serving patterns
- Request/response vs queue-based inference
- Two-tower architectures (RecSys)
- Feature pipeline design (online vs offline)

###### Topic: Data Systems Design ← NEW topic

- OLTP vs OLAP for ML workloads
- Event sourcing & CQRS pattern
- Lambda architecture (batch + stream)
- Kappa architecture (stream only)
- Data mesh principles
- Stream processing vs micro-batch trade-offs

###### Topic: ML Platform Architecture ← NEW topic

- Self-serve ML platform design
- Internal tooling (experiment tracking, feature store, model registry)
- Platform abstraction layers
- Multi-tenancy in ML platforms
- Compute scheduling (Kubernetes, Ray)
- Cost attribution & showback

###### Topic: ML at Scale

- Large-scale model training (distributed strategies)
- Large-scale serving (autoscaling, latency budgets)
- Multi-model serving
- A/B testing infrastructure at scale

###### Topic: Reliability & Operations

- SLA/SLO/SLI for ML systems
- Circuit breakers & fallback strategies
- Disaster recovery for ML systems
- Cost optimization patterns

#### SKILL: Applied Fine-Tuning & Advanced Prompting

`Tier: 2.5T` | `Roles: AIE, MLE`

###### Topic: Parameter-Efficient Fine-Tuning

- LoRA & QLoRA mathematics
- Adapters and prompt tuning
- Dataset preparation and chat templates (ShareGPT format)
- Tooling: Axolotl, Unsloth

###### Topic: Programmatic Prompting

- DSPy (Signatures, Modules, Teleprompters)
- ReAct, Tree of Thoughts, and Chain of Thought
- RAG chunking optimizations and reranking

#### SKILL: Generative AI & Large Language Models

`Tier: 2.5T` | `Roles: MLE, AIE`

###### Topic: Transformer Architecture

- Tokenization (BPE, SentencePiece)
- Positional encoding (absolute, RoPE, ALiBi)
- Self-attention & multi-head attention
- Encoder / Decoder architecture
- FlashAttention & FlashAttention-2 internals
- Efficient transformer variants (Longformer, BigBird, Linear Attention)

###### Topic: Foundation Models

- Pretraining paradigms (MLM, CLM, denoising)
- BERT (MLM) & GPT family (CLM) deep internals
- Scaling laws & emergent abilities (Chinchilla, OpenAI scaling)
- RLHF & Constitutional AI
- Multimodal foundation models (CLIP, Flamingo, Gemini, GPT-4V)
- Dataset engineering (instruction data, Alpaca, PromptSource)
- Generative AI for synthetic data

###### Topic: LLMs

- GPT, Claude, LLaMA, Mistral architectures
- Open-source LLMs (LLaMA, Mistral, Qwen, Phi)
- Fine-tuning objectives
- RLHF (PPO, DPO)
- LLM evaluation (BLEU, ROUGE, Perplexity, HELM, MMLU, TruthfulQA)
- Mixture of Experts (MoE)

###### Topic: Prompting

- Zero/few-shot prompting
- Chain-of-thought (CoT) & Tree-of-Thought (ToT)
- In-context learning mechanics
- Prompt evaluation & benchmarks
- LangSmith prompt versioning
- Context engineering (context window management, compaction, prompt caching)

###### Topic: RAG & Vector Systems

- Chunking strategies
- Embedding models & similarity (OpenAI, SBERT, HuggingFace)
- Vector databases (Pinecone, Weaviate, Chroma, FAISS, pgvector)
- HNSW indexing, ANN tradeoffs, hybrid search
- Retrieval & reranking (Cohere Rerank, Haystack)
- Graph RAG (knowledge graph + RAG hybrid) ← NEW
- Agentic RAG (iterative retrieval loops) ← NEW
- RAG evaluation (RAGAS, faithfulness, relevance)
- LangChain, LlamaIndex (framework subtopics)
- Document splitting / text chunking

###### Topic: Agents

- Agent fundamentals (ReAct, tool use, planning)
- Memory architectures (in-context, vector, episodic, procedural)
- Function calling APIs
- MCP (Model Context Protocol)
- Host, client, server model; transport layer (stdio, SSE)
- Primitives: Tools, Resources, Prompts, Sampling
- Building & consuming MCP servers (Python & TypeScript SDKs)
- MCP security (prompt injection, permission scoping)
- Browser & code execution tools
- Multi-agent systems (orchestrator-subagent, debate patterns)
- Agent evaluation (trajectory, tool use accuracy, task completion)
- Frameworks (LangChain agents, LlamaIndex, AutoGen, CrewAI)
- Gradio, Streamlit, Chainlit for LLM demos

###### Topic: Safety & Red-teaming ← NEW topic

- Jailbreaking & adversarial prompts taxonomy
- Prompt injection attacks (direct & indirect)
- Safety benchmarks (TruthfulQA, HarmBench, SALAD-Bench)
- Red-teaming methodology (manual + automated)
- Constitutional AI & RLAIF approaches
- Alignment evaluation pipelines
- Harmful content detection & mitigation

###### Topic: LLM Evaluation Infrastructure ← NEW topic

- Automated evaluation pipelines
- LLM-as-judge patterns (GPT-4 / Claude as evaluator)
- Regression testing for model updates
- Pairwise comparison & ELO rating systems (LMSYS Chatbot Arena)
- Benchmark contamination detection
- Human evaluation design

###### Topic: LLM Inference & Serving

- KV cache mechanics
- Quantization, speculative decoding, continuous batching
- vLLM (PagedAttention, deployment)
- TGI (HuggingFace, tensor parallelism, streaming)
- TensorRT-LLM
- LLM deployment options (cloud, local, edge)
- Constrained decoding (JSON schema, grammars, function-call validation)

###### Topic: LLM Observability & Ops

- Tracing & spans for LLM apps (LangSmith, Langfuse, OpenTelemetry)
- Cost & latency monitoring (token budgets, per-request accounting)
- Prompt & model version management (rollout, canary, rollback)
- Guardrails in production (moderation APIs, output validation, PII filtering)
- Semantic caching strategies
- Feedback capture loops (thumbs, corrections, implicit signals)

### Tier 3

#### SKILL: ML Systems

`Tier: 3T` | `Roles: MLE, AIE`

###### Topic: Production ML Systems at Scale

- Serving infrastructure design (multi-region, multi-model)
- Feature store design at scale
- Real-time + batch hybrid architectures
- ML platform design (internal tooling)

###### Topic: Reliability Engineering

- SLO budget management
- Chaos engineering for ML systems
- Incident response & post-mortems for ML

#### SKILL: Foundation Models (Research Depth)

`Tier: 3T` | `Roles: MLE, AIE`

###### Topic: Pretraining at Scale

- Infrastructure (DeepSpeed, FSDP, Megatron-LM)
- Data pipeline at billion-token scale
- Curriculum learning & data mixing
- Checkpointing & fault tolerance

###### Topic: Fine-tuning (Research Depth)

- LoRA, QLoRA, PEFT at depth
- Full fine-tuning vs PEFT trade-offs
- Instruction tuning methodology
- Fine-tuning infrastructure (compute planning, data pipelines for SFT)

###### Topic: RLHF & Alignment

- PPO for LLMs (reward model + policy training loop)
- DPO (direct preference optimization mechanics)
- Constitutional AI & RLAIF
- Red-teaming & safety evaluation at research depth

###### Topic: Quantization (Research Depth)

- GPTQ (post-training quantization)
- QAT (quantization-aware training)
- GGUF for edge deployment
- Quantization error analysis & calibration

###### Topic: LLM Evaluation (Research Depth)

- HELM, MMLU, TruthfulQA at depth
- Custom benchmark design
- Contamination detection methodology
- Human evaluation design

### Tier 4

#### SKILL: LLM Architecture Research

`Tier: 4T` | `Roles: MLE, AIE`

###### Topic: Advanced Architecture

- MoE routing mechanisms (top-k, expert capacity, load balancing)
- Long-context architectures
- Multimodal architecture design (late/early fusion)
- Efficient inference architectures

###### Topic: Alignment Research

- Mechanistic interpretability (circuits, features)
- Activation steering
- Constitutional methods at research depth
- Sleeper agents & deceptive alignment

#### SKILL: Cross-path Master

`Tier: 4T` | `Roles: MLE, DS, AIE`

###### Topic: MLE + DS Convergence

- Causal ML systems in production (MLE + DS)
- Probabilistic ML serving (MLE + DS)
- Research-grade A/B testing infrastructure (MLE + DS)
- Cross-path mentorship & knowledge transfer

#### SKILL: Pretraining at Scale (Research)

`Tier: 4T` | `Roles: MLE, AIE`

###### Topic: Novel Architecture Research

- Mixture of Experts (MoE) design & training
- Sparse models & conditional computation
- State space models (Mamba, RWKV)
- Linear attention & sub-quadratic architectures
- Architectural ablation methodology

###### Topic: Scaling Research

- Scaling law experimentation
- Data efficiency research
- Emergent capabilities study
- Infrastructure innovation (custom ASIC, network topology)

## German Language (GL)

### Tier F

#### SKILL: German Fundamentals (A1)

`Tier: F` | `Roles: GER`

###### Topic: Basics

- Alphabet, phonetics, and Umlauts
- Cases introduction (Nominativ, Akkusativ)
- Present tense and modal verbs

#### SKILL: German A1→B1

`Tier: F` | `Roles: ALL`

###### Topic: Phonetics & Script

- German alphabet & Umlauts (ä, ö, ü, ß)
- Pronunciation rules (w, v, z, ch, r)
- Word stress patterns
- Reading aloud fluency

###### Topic: Core Grammar

- Articles & noun gender (der/die/das)
- Cases: Nominativ, Akkusativ, Dativ
- Present, Perfekt, Präteritum
- Modal verbs (können, müssen, wollen)

###### Topic: Foundational Vocabulary

- Grundwortschatz (A1–B1 ~2000 words)
- False friends (Spanish/English interference)
- Number, time, date expressions
- Everyday situational vocabulary

###### Topic: Basic Communication

- Greetings & introductions
- Asking for / giving information
- Describing people, places, routines
- Simple written messages

---
---

### Tier 1

#### SKILL: German Basics (A2-B1)

`Tier: 1T` | `Roles: GER`

###### Topic: Conversational

- Dativ and Genitiv cases
- Präteritum and Perfekt tenses
- Subordinate clauses (weil, dass, ob)

### Tier 2

#### SKILL: German B2→C1

`Tier: 2T` | `Roles: GL`

###### Topic: Complex Grammar

- Konjunktiv II (hypothetical & polite)
- Passive constructions (Vorgangs- & Zustandspassiv)
- Infinitive & participial clauses
- Extended attribute constructions

###### Topic: Advanced Vocabulary

- Academic & professional register
- Collocations & fixed expressions
- Nuanced synonyms
- False friends at advanced level

###### Topic: Writing

- Argumentation & hedging (einerseits/andererseits)
- Formal correspondence
- Coherence & cohesive devices
- Zusammenfassung (summary writing)

###### Topic: Speaking & Listening

- Fluency under pressure & topic switches
- Discourse markers (allerdings, dennoch, gleichwohl)
- Listening for inference & implication
- Presenting & defending a position

#### SKILL: German Intermediate (B2-C1)

`Tier: 2T` | `Roles: GL`

###### Topic: Professional German

- Konjunktiv II (Polite requests, hypotheticals)
- Passive voice constructions
- Technical IT vocabulary in DACH regions

### Tier 2.5

### Tier 3

### Tier 4

## English Language (EL)

### Tier F

#### SKILL: English Fundamentals (A1-A2)

`Tier: F` | `Roles: ENG`

###### Topic: Basic Communication

- Essential vocabulary and survival phrases
- Present, Past, and Future simple tenses
- Basic sentence structure

### Tier 1

#### SKILL: English Basic (B1-B2)

`Tier: 1T` | `Roles: ENG`

###### Topic: Professional Register

- Passive voice and complex conditionals
- Technical vocabulary and software engineering terms
- Writing clear PR descriptions and emails

###### Topic: Grammar & Structure

- Complex sentence construction
- Conditionals & modal verbs
- Passive & reported speech
- Cohesive devices

###### Topic: Vocabulary

- Academic & professional register
- Collocations & fixed phrases
- Idiomatic expressions
- False friends (for Spanish speakers)

###### Topic: Writing

- Paragraph structure & coherence
- Formal vs informal register
- Argumentation & hedging
- Technical writing

###### Topic: Speaking & Listening

- Fluency under pressure
- Discourse markers
- Listening for inference
- Pronunciation & stress patterns

### Tier 2

#### SKILL: English Intermediate (C1-C2)

`Tier: 2T` | `Roles: ENG`

###### Topic: Advanced Nuance

- Idiomatic expressions and phrasal verbs
- Persuasive argumentation and hedging
- Public speaking and presentation skills

### Tier 2.5

### Tier 3

### Tier 4

## OUTSIDE TREE — Career Track (milestone-tracked, not SR-assessed)

- GitHub profile & repository presentation
- Building a personal landing page
- First open-source contribution
- Resume & portfolio tailoring (FAANG/target roles)
- Stakeholder engagement & cross-functional teamwork
- Levels.fyi, Blind, FAANGPath research
