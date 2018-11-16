# Calculating network statistics with rolling time window

```python
days = 14
window_size = days*24*60*60 # window size is 30*24*60*60 seconds = 30days

rt = pp.RollingTimeWindow(t, window_size, step_size=1*24*60*60, directed=False) #step size is 1*24*60*60 seconds that is 1 day
for cn in rt:
    degree_temp = []
    for k, v in cn.nodes.items():
        degree_temp.append(v['degree'])
    degree.append(degree_temp)
    eigen.append(pp.algorithms.spectral.algebraic_connectivity(cn))
    mean.append(pp.algorithms.statistics.mean_degree(cn))
```

```python
import scipy.stats as stat

variance = [np.var(l) for l in degree]
skewness = [stat.skew(l) for l in degree]
kurtosis = [stat.kurtosis(l, fisher=False) for l in degree]
```

### Calculating effect of removing a node on network structure and the statistics

```python
def stats(network):
  degree = []
  for k, v in network.nodes.items():
      degree.append(v['degree'])

  return [pp.algorithms.spectral.algebraic_connectivity(network), np.mean(degree), np.var(degree), stat.kurtosis(degree), stat.skew(degree) ]

def diff_dict(s1, s2):
  return {'connectivity' : s1[0] - s2[0], 'mean': s1[1] - s2[1], 'variance':s1[2] - s2[2], 'kurtosis': s1[3] - s2[3], 'skewness' : s1[4] - s2[4]}
```
```python
for node, prop in n.nodes.items():
    net_copy = deepcopy(n)
    net_copy.remove_node(node)
    s1 = stats(net_copy)
    s2 = stats(n)
    temp = {}
    temp['id'] = node
    temp.update(diff_dict(s1, s2))
    temp.update(prop)
    dump['nodes'].append(temp)
```
