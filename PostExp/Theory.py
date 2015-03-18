from random import random, choice
from bayesian.bbn import build_bbn_from_conditionals as build_graph
import numpy as np
import thinkbayes as prob #Imports Alan Downey's useful "think bayes module"
from scipy.special import gamma, digamma
from math import log
from numpy import prod
from gaussint import simp_int
def beta_func(counts):
    numerator=np.array([gamma_func(count) for count in counts]).prod()
    denom=gamma(sum(counts))
    return float(numerator)/denom

def dirichlet_entropy(alpha):
    alpha0=sum(alpha)
    K=len(alpha)
    return log(beta_func(alpha),2) + (alpha0-K)*digamma(alpha0) - sum([(a-1)*digamma(a) for a in alpha])

def random_count_sequence(K, T):
    positions=[0]*K
    for i in range(T):
        index=choice(range(K))
	positions[index]+=1
 	return positions

def freqs(ls):
    norm = sum(ls)
    return [num/float(norm) for num in ls]

def optprior(K, T, old=[]):
    old=random_count_sequence(K, T-1) if old==[] else old
    new=[o+1/float(K) for o in old]
    return [num/float(T) for num in new]


def dirichlet(K, T, old=[]):
    old=random_count_sequence(K, T-1) if old==[] else old
    dirich = prob.Dirichlet(K)
    dirich.Update(old)
    probs=[dirich.MarginalBeta(i).Mean() for i in range(K)]
    return probs

def entropy(counts):
    '''Compute entropy.'''
    counts=np.array(counts);
    ps = counts/float(sum(counts))  # coerce to float and normalize
    ps = ps[nonzero(ps)]            # toss out zeros
    H = -sum(ps*np.log2(ps))   # compute entropy
    return H

def mutual_inf(x, y, bins=10):
    '''Compute mutual information'''
    x=np.array(x)
    y=np.array(y)
    counts_xy = histogram2d(x, y, bins=bins)[0]
    counts_x  = histogram(  x,    bins=bins)[0]
    counts_y  = histogram(  y,    bins=bins)[0]
    
    H_xy = entropy(counts_xy)
    H_x  = entropy(counts_x)
    H_y  = entropy(counts_y)
    
    return H_x + H_y - H_xy

def makeOneCauseMI(p=0.5, q=0.5):
    px=prob.MakePmfFromDict({"H":p, "L":1.0-p})
    joint = prob.Joint()
    for v1, p1 in px.Items():
        if v1 =="H":
            joint.Set((v1, "H"), p1*q)
            joint.Set((v1, "L"), p1*q)
        else:
            joint.Set((v1, "H"), 0.0)
            joint.Set((v1, "L"), p1*1.0)
    py=joint.Marginal(1)
    return px, py, joint

#Perhaps symmetry of the transition matrix would come out of the optimization theory, that would be better than just a perhaps unfounded assumption.
Beta=lambda a: prod([gamma(i) for i in a])/gamma(sum(a))
def Derichlet(alph, x):
    if len(alph)==len(x):
        return (1/Beta(alph))*prod([x[i]**(alph[i]-1) for i in range(len(alph))])

    
def modelProp(u, g, lam):
    """
    u, is some utility function, g is a Bayes Net and lam is a parameter of rationality
    """
    h=lambda x: exp(lam*u(x))
    p=exp(lam*u(g)) #/simplex_int(h)
    return p
