######################################################################
#
# Functions to calculate integration points and weights for Gaussian
# quadrature written by Mark Newman <mejn@umich.edu>, June 4, 2011
# and the integration points and weights used for integrating functions    
# defined on a k-dimensional simplex were translated from MATLAB code by 
# Greg von Winckel <gregvw(at)math(dot)unm(dot)edu>. Python translation by 
# Johannes Castner <jac2130@columbia.edu>. 
# You may use, share, or modify this file freely.

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
#
######################################################################

from numpy import ones,copy,cos,tan,pi,linspace, array, sqrt, diag, eye, reshape, prod, cumprod
from numpy.linalg import eig, det
from numpy import tile as repmat #for compatibility with Matlab
import numpy as np
from scitools.numpyutils import ndgrid
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
    A=repmat(1.0*k**2,(1,N))/(nnk*(nnk+2));
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
    xw=zip(x, w)
    xw.sort()
    return [array(x) for x in zip(*xw)]

def simplex_quad(n, N):
    """
    n: number of dimensions (bins)
    N: number of integration points per bin
    """
    vert=eye(n+1, n)
    
    if n==1:
        q, w = rquad(N, 0)
    else:
        q, w=zip(*[rquad(N, n-(k+1)) for k in range(n)])
        Q=ndgrid(*q); W=ndgrid(*w)
        shaper=np.zeros([N, N, N*n])
        for i in range(n):
            shaper[:,:,i*N:(i+1)*N] = Q[i]
        qu = reshape(shaper,[N**n,n], order='F')
        shaper=np.zeros([N, N, N*n])
        for i in range(n):
            shaper[:,:,i*N:(i+1)*N] = W[i]
        wu = reshape(shaper,[N**n,n], order='F')
        m=eye(n+1)
        m[1:n+1,0]=-1
        c=np.dot(m, vert)
        W=abs(det(c[1:n+1, :]))*prod(wu, axis=1)
        qp=cumprod(qu, 1)
        e=np.ones([N**n, 1])
        np.append((1-qu[:, :n-1]), array(e), 1)
        array([e, qp[:, :n-2], qp[:,n-1]])
        X=np.dot(np.append(array(e),np.append((1-qu[:, :n-1]), array(e), 1)*array([array(e), qp[:, :n-2], qp[:,n-1]]).T,1), c)
        return W, X
