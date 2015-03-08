######################################################################
#
# Functions to calculate integration points and weights for Gaussian
# quadrature
#
# x,w = gaussxw(N) returns integration points x and integration
#           weights w such that sum_i w[i]*f(x[i]) is the Nth-order
#           Gaussian approximation to the integral int_{-1}^1 f(x) dx
# x,w = gaussxwab(N,a,b) returns integration points and weights
#           mapped to the interval [a,b], so that sum_i w[i]*f(x[i])
#           is the Nth-order Gaussian approximation to the integral
#           int_a^b f(x) dx
#
# This code finds the zeros of the nth Legendre polynomial using
# Newton's method, starting from the approximation given in Abramowitz
# and Stegun 22.16.6.  The Legendre polynomial itself is evaluated
# using the recurrence relation given in Abramowitz and Stegun
# 22.7.10.  The function has been checked against other sources for
# values of N up to 1000.  It is compatible with version 2 and version
# 3 of Python.
#
# Written by Mark Newman <mejn@umich.edu>, June 4, 2011
# You may use, share, or modify this file freely
#
######################################################################
import numpy as np
from numpy import ones,copy,cos,tan,pi,linspace, array, diag, sort, sqrt
from numpy.linalg import eig
from numpy import tile as repmat #for compatibility with Matlab


def gaussxw(N):

    # Initial approximation to roots of the Legendre polynomial
    a = linspace(3,4*N-1,N)/(4*N+2)
    x = cos(pi*a+1/(8*N*N*tan(a)))

    # Find roots using Newton's method
    epsilon = 1e-15
    delta = 1.0
    while delta>epsilon:
        p0 = ones(N,float)
        p1 = copy(x)
        for k in range(1,N):
            p0,p1 = p1,((2*k+1)*x*p1-k*p0)/(k+1)
        dp = (N+1)*(p0-x*p1)/(1-x*x)
        dx = p1/dp
        x -= dx
        delta = max(abs(dx))

    # Calculate the weights
    w = 2*(N+1)*(N+1)/(N*N*(1-x*x)*dp*dp)

    return x,w

def gaussxwab(N,a,b):
    x,w = gaussxw(N)
    return 0.5*(b-a)*x+0.5*(b+a),0.5*(b-a)*w

def rquad(N,k):
    k1=k+1; k2=k+2; n=array(range(1, N+1));  nnk=2*n+k;
    A=repmat(k^2,(1,N))/(nnk*(nnk+2));
    A=np.append(array([float(k)/k2]), A);
    n=array(range(1, N)); nnk=nnk[n]; n=n+1;
    B1=4*float(k1)/(k2*k2*(k+3)); nk=n+k; nnk2=nnk*nnk;
    B=4.0*(n*nk)**2/(nnk2*nnk2-nnk2);
    ab=np.append(array([2**float(k1)/k1, B1]), B);
    s=sqrt(ab[1:N]);
    x, v=eig(diag(A[0:N]) + diag(s, -1) + diag(s, +1))
    I, x=zip(*enumerate(x))
    x=array(x)
    x=(x+1)/2; w=((1.0/2)**(k1))*ab[0]*v[0,I]**2;
    #Still have to fix sorting by x.
    xw=zip(x, w)
    xw.sort()
    return [array(x) for x in zip(*xw)]
