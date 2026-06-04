---
title: Cauchy Integral Formula
date: 2026-03-20
category: Complex Analysis
---

I want this sequence of posts to illuminate the central ideas of complex analysis, rather than get stuck hashing out computations or definitions, losing track of the bigger picture in the process. To that end, I am going to assume you know the following theorem, which amounts to a corollary of Green's Theorem from multivariable calculus:

<style>
.theorem-box {
  margin: 1.6em 0;
  padding: 1.1em 1.25em 1.15em;
  border-left: 4px solid #245;
  background: linear-gradient(to right, rgba(34, 68, 85, 0.06), rgba(34, 68, 85, 0.02));
  border-radius: 0 6px 6px 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.theorem-box .theorem-title {
  font-family: 'Latin Modern Roman', 'Computer Modern', Georgia, serif;
  font-size: 0.72em;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #245;
  font-weight: 600;
  margin: 0 0 0.85em;
}
.theorem-box .theorem-body {
  margin: 0;
  line-height: 1.65;
}
.theorem-box .theorem-body p { margin: 0 0 0.75em; }
.theorem-box .theorem-body p:last-child { margin-bottom: 0; }
</style>

<div class="theorem-box" role="note" aria-label="Cauchy–Goursat theorem">
<div class="theorem-title">Theorem (Cauchy–Goursat)</div>
<div class="theorem-body">
<p>Let $\Omega \subseteq \mathbb{C}$ be open and simply connected, and let $f$ be analytic throughout $\Omega$. If $\gamma$ is a closed contour (i.e. a loop) lying in $\Omega$, then</p>
$$\oint_{\gamma} f(z)\,dz = 0.$$
</div>
</div>

I will also assume the closely related principle of continuous deformation, which also falls out from Green's Theorem:

<div class="theorem-box" role="note" aria-label="Principle of continuous deformation">
<div class="theorem-title">Principle of Continuous Deformation</div>
<div class="theorem-body">
<p>Let $\gamma_0, \gamma_1$ be two contours with the same endpoints, and let $f$ be analytic throughout the region swept out by a continuous deformation from $\gamma_0$ to $\gamma_1$. Then</p>
$$\int_{\gamma_0} f(z)\,dz = \int_{\gamma_1} f(z)\,dz.$$
</div>
</div>

We should note that the Principle of Continuous Deformation, as stated above, actually implies the Cauchy-Goursat Theorem. To see why, assume $\Omega \subseteq \mathbb{C}$ and suppose $\gamma$ is a contour lying in $\Omega$. We set out to calculate $\oint_{\gamma} f(z)\,dz.$

(Should motivate argument, explain why we cannot just apply Cauchy Goursat to \Delta{h}/\Delta{z})

The Principle of Continuous Deformation says that if we want to integrate along a loop $\gamma_0$, we can deform $\gamma_0$ to any other loop $\gamma_1$ of our choice (provided that the integrand is analytic in the region in between). Thus, we can let $\gamma_0 = \gamma$ and $\gamma_1$ be an extremely tiny circle centered at an arbitrary point $z_0$ with radius $\varepsilon$. 




Since $f$ is analytic, it is continuous at $z_0$ and in particular $f(z)$ is approximately constant in small neighborhoods of $z_0$ (we're going to gloss over the $\epsilon$-$\delta$ stuff for brevity). Thus, as $\varepsilon \rightarrow 0$, we have $\oint_{\gamma_1}f(z)\,dz = O(\varepsilon)$. On the other hand, $\oint_{\gamma_1}f(z)\,dz = \oint_{\gamma_0}f(z)\,dz$ so in fact $$\oint_{\gamma_0}f(z)\,dz = O(\varepsilon).$$ However, $\gamma_0$ does not depend on $\varepsilon$, so this implies $\oint_{\gamma_0}f(z)\,dz = 0$, as desired. 

There is an important lesson we should take from the above derivation. Namely, that an integral around a closed loop is vulnerable to this "shrinking argument", and thus shown to be $0$, as long as the integrand is bounded as we take smaller and smaller circles containing some point $z_0$ (and differentiable throughout the region in between). 

Now notice that $\frac{\Delta{f}}{\Delta{z}}$ induced by a point $z_0$ has precisely this property when $f$ has a derivative at $z_0$. Thus, we obtain 

$$\oint_{\gamma}\frac{\Delta{f}}{\Delta{z}} = O(\varepsilon)$$ as $\varepsilon \rightarrow 0$ and therefore $$\oint_{\gamma}\frac{\Delta{f}}{\Delta{z}} = 0.$$ Now unfolding the definition of $\frac{\Delta{f}}{\Delta{z}}$, we obtain $$\oint_{\gamma}\frac{f(z) - f(z_0)}{z - z_0} = 0.$$ Distributing the denominator and noting that $\oint_{\gamma}\frac{1}{z - z_0} = 2\pi{i}$, we finally obtain the Cauchy Integral Formula: $$f(z_0) = \frac{1}{2\pi{i}}\oint_{\gamma}\frac{f(z)}{z - z_0}.$$