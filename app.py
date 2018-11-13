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
from flask_cors import CORS, cross_origin
import os
from copy import deepcopy
import scipy.stats as stat
import numpy as np

print(os.getcwd())
with open(os.getcwd()+'\\data\\conversation_data.json') as f:
    temp = json.load(f)
    data = temp['edges']
    nodes = temp['nodes']

with open(os.getcwd()+'\\data\\data3.json') as f:
    temp = json.load(f)
    dt = temp

def filter_activity(data, start_date, end_date):
    return [t for t in data if parser.parse(t['timestamp']).date() >= start_date and parser.parse(t['timestamp']).date() <= end_date]

def stats(network):
    degree = []
    for k, v in network.nodes.items():
        degree.append(v['degree'])
    
    return [pp.algorithms.spectral.algebraic_connectivity(network), np.mean(degree), np.var(degree), stat.kurtosis(degree), stat.skew(degree) ]

def diff_dict(s1, s2):
    return {'connectivity' : s1[0] - s2[0], 'mean': s1[1] - s2[1], 'var':s1[2] - s2[2], 'kurtosis': s1[3] - s2[3], 'skew' : s1[4] - s2[4]}

app = Flask(__name__)

CORS(app)

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

@app.route('/stats', methods=['GET'])
def returnStats():
    dump = {}

    return jsonify(dump)

if __name__ == "__main__":
    app.run(debug=True)