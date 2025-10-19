** Forging the Algorithm **
Arseniy



** Backstory **

In earlier posts I talked about my time at Equifax, where I encountered instability in credit-scoring models. I outlined the main ideas behind feature engineering and target construction for this task, and I wrote the largest PL/SQL script I’ve ever written.

** Forging an Algorithm **

After a while I joined HeadHunter. Things stabilized and the work began. Two or three times a week, after a full day at the office, I would travel from Alekseevskaya to Park Kultury in Moscow (about 45 minutes). There, my friend and I worked on gradient-boosted decision trees with extrapolation. We started by deriving the standard gradient-boosted decision-trees algorithm.

The core procedure is splitting. Let’s unpack it step by step. First, we need to choose a loss function to minimize. Suppose our model produces a score s for object i whose true label is y. The loss for this object is l(s, y), and the total loss is:

<figure class="eq-block">
  <img src="./assets/eq-main_v314.png" alt="L = \sum_{i=1}^{n} l(s_i, y_i)" />
</figure>

Now we have a set of records. Each record contains a factor and a target. For the whole dataset we can calculate the result of our inference - mean value of target and it minimize MSE and Logloss. Then we can try to split our dataset into two parts, so we can infer value for the one part and for the another separately. It gives one more degree of freedom and allows to make our loss lower. Gain is the difference between out loss on initial dataset and the sum of losses over two splitted datasets.

In order to solve this problem for a generic loss function, one can use Tailor approximation and the fact that the inference value is one for the whole dataset 

<figure class="eq-illustration">
  <img src="./assets/parabolic-minimum.webp" alt="Quadratic approximation of the loss surface" />
</figure>

The key expression x0 = (l') / (l'') is surprisingly simple. It means that we can make Newton's step toward the minimum, and really it's a second-order method.

Now for each split we can calculate loss defect and find the split with the best defect value. There is one more interesting trick here: it's convenient to sort each factor by its value and move through these values incrementally updating loss defect. And, basically, that is it. Vanilla GBDT in a nutshell.

Of course, there are some interesting things to discuss later: multithreading, contemporary standards on GBDT trees building, truncating policies, regularizations. But as idea, it's all you need to remember:
* make splits by factors
* find the optimal split using loss defect expression
* repeat recursively to build a tree
