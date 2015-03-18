from gaussxw import gaussxw, simplex_quad, rquad
from numpy import prod
from scipy.special import gamma, digamma

def f(x):
    return x**4 - 2*x + 1


def gaussint(func, N=5, a=0, b=1):
    
#a = 0.0
#b = 2.0

# Calculate the sample points and weights, then map them
# to the required integration domain
    x,w = gaussxw(N)
    xp = 0.5*(b-a)*x + 0.5*(b+a)
    wp = 0.5*(b-a)*w

# Perform the integration
    s = 0.0
    for i in range(N):
        s += wp[i]*f(xp[i])
    return s

def simp_int(func, N=5, k=3):
    
#a = 0.0
#b = 2.0
    if (not N > k+1):
        N = k+2
# Calculate the sample points and weights, then map them
# to the required integration domain
    w, x=simplex_quad(k, N)
   # Perform the integration
    s = 0.0
    for i in range(np.shape(x)[0]):
        s += k*w[i]*func(list(x[i]))
    return s
