import os, sys

#os.chdir('../../bayesian-belief-networks')

from bayesian.bbn import build_bbn_from_conditionals as build_graph

def indep_wrap(varName, d={}, p=0.5):
    d[varName]= [[[],{"H":p , "L":1.0-p}]]
    return d

def one_cause_wrap(depVar, indepVar, d, p=0.5, neg=set()):
    if indepVar not in neg:
        d[depVar]=[
            [[[indepVar, "H"]], {"H": p, "L": 1-p}],
            [[[indepVar, "L"]], {"H": 0, "L": 1.0}]]
    else:
        d[depVar]=[
            [[[indepVar, "H"]], {"H": 0, "L": 1.0}],
            [[[indepVar, "L"]], {"H": p, "L": 1.0-p}]]
    return d

def causes_wrap(depVar, indepVarList, d, p=0.5, neg=set()):
    n=len(indepVarList)
    crossprod=[[[list(l)] for l in zip(indepVarList, item)] for item in  product (["H", "L"], repeat = n)]
    for item in crossprod:
        prod=1
        digital = [1 if (y[0][1]=="H" and y[0][0] not in neg or y[0][1]=="L" and y[0][0] in neg) else 0 for y in item]
        for i in digital: prod*=(1-p)**i
        item.append({"H":1-prod, "L": prod})
    d[depVar]=crossprod
    return d
