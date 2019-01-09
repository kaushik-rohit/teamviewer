from flask import Flask, render_template
from flask import jsonify
from flask import request
import pathpy as pp
import numpy as np
import json
from datetime import datetime
from datetime import timedelta
from datetime import date
from dateutil import parser
import matplotlib.pyplot as plt
import os
from copy import deepcopy
import scipy.stats as stat
import numpy as np
from teamviewer import app

with open(os.getcwd()+'\\data\\graph.json') as f:
    temp = json.load(f)
    data = temp['edges']
    nodes = temp['nodes']

with open(os.getcwd()+'\\data\\stats.json') as f:
    temp = json.load(f)
    dt = temp

def filter_activity(data, start_date, end_date):
    return [t for t in data if parser.parse(t['timestamp']).date() >= start_date and parser.parse(t['timestamp']).date() <= end_date]

def stats(network):
    degree = []
    for k, v in network.nodes.items():
        degree.append(v['degree'])
    
    return [pp.algorithms.spectral.algebraic_connectivity(network, maxiter=30), np.mean(degree), np.var(degree), stat.kurtosis(degree), stat.skew(degree) ]

def conversation_stat(data, days):
    window_size = days*24*60*60 # window size is 30*24*60*60 seconds = 30days
    edges = data["edges"]
    nodes = data["nodes"]

    t= pp.TemporalNetwork()
    for d in edges:
        if(d['from'] == '' or d['to'] == ''):
            continue
        t.add_edge(d["from"], d["to"], d["timestamp"])
    degree = []
    mean = []
    eigen = []
    rt = pp.RollingTimeWindow(t, window_size, step_size=1*24*60*60, directed=False) #step size is 1*24*60*60 seconds that is 1 day
    for cn in rt:
        degree_temp = []
        for k, v in cn.nodes.items():
            degree_temp.append(v['degree'])
        degree.append(degree_temp)
        eigen.append(pp.algorithms.spectral.algebraic_connectivity(cn))
        mean.append(pp.algorithms.statistics.mean_degree(cn))
        #pp.visualisation.plot(cn)


    variance = [np.var(l) for l in degree]
    skewness = [stat.skew(l) for l in degree]
    kurtosis = [stat.kurtosis(l, fisher=False) for l in degree]

    mean_base = []
    variance_base = []
    skewness_base = []
    kurtosis_base = []
    dump = []
    dt = parser.parse(min([x['timestamp'] for x in data])).date()
    for i in range(len(mean)):
        temp = {}
        m, v, s,k = stat.poisson.stats(mean[i], moments='mvsk')
        temp['date'] = dt.strftime('%m/%d/%Y')
        mean_base.append(m)
        variance_base.append(v)
        skewness_base.append(s)
        kurtosis_base.append(k)

        temp['mean'] = float(m)
        temp['var'] = float(variance[i] - v)
        print(skewness[i] - s)
        temp['skewness'] = skewness[i] - s
        temp['kurtosis'] = kurtosis[i] - k
        temp['robustness'] = float(eigen[i])
        dump.append(temp)
        dt = dt + timedelta(days=1)
    
    return dump

def diff_dict(s1, s2):
    return {'connectivity' : s1[0] - s2[0], 'mean': s1[1] - s2[1], 'variance':s1[2] - s2[2], 'kurtosis': s1[3] - s2[3], 'skewness' : s1[4] - s2[4]}

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', data=dt) 

@app.route('/graph', methods=['GET'])
def returnAll():
    s = request.args.get('start')
    e = request.args.get('end')
    print(s)
    print(e)
    start_date = parser.parse(s).date()
    end_date = parser.parse(e).date()
    _dist = {}

    t= pp.TemporalNetwork()
    act = filter_activity(data, start_date, end_date)
    for a in act:
        if(a['from'] == '' or a['to'] == ''):
            continue
        t.add_edge(a["from"], a["to"], a["timestamp"])
    n = pp.Network.from_temporal_network(t)
    n = n.to_undirected()

    dump = {'nodes': [], 'links':[]}

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
    
    for keys in n.edges.keys():
        temp = {}
        temp['source'] = keys[0]
        temp['target'] = keys[1]
        dump['links'].append(temp)

    print(jsonify(dump))
    return jsonify(dump)

@app.route('/stats', methods=['GET', 'POST'])
def returnStats():
    size = int(request.args.get('window'))
    return jsonify(conversation_stat(data, size))

@app.route('/filechange', methods=['POST'])
def returnStats2():
    data = request.json
    print(data)
    return jsonify(conversation_stat(data, 7))

if __name__ == "__main__":
    app.run(debug=True)