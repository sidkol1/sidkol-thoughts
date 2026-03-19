---
title: Complex Integration
date: 2025-06-25
category: Complex Analysis
---

Integrals in calculus classes are often introduced as representing the area under a curve. When the curve happens to be a rate of change for some quantity, this area in turn represents the change in that quantity over some interval of time.

![Integral of 2x from 0 to t](assets/integral-area.gif)

As was the case with differentiation, we should take a broader and more abstract perspective before generalizing to complex numbers. An integral $$\int_{x_1}^{x_2}f(x)\,dx$$ is an infinite sum, whose terms are the values $f(x_1)$, $f(x_2)$ and everything in between, and are weighted by infinitesmal weights $dx$ that sum to $x_2 - x_1$. (This notion is made formal through Riemann sums).

![Riemann sum](assets/riemann-sum.gif)

<div class="caption">A Riemann sum for $\int_{0}^{3}2x\,dx$ is shown above, with $\Delta{x} = 0.5$ and evaluation at the left-endpoint. The integral itself is found by letting $\Delta{x} \rightarrow 0$.</div>

With some thought, we can see how we might analogously think about integrating a function $g: \mathbb{C} \rightarrow \mathbb{C}$. In $\mathbb{R}$, we take a path from $x_1$ to $x_2$. Then we break it into pieces and evaluate $f$ at each piece. Finally, we sum these outputs of $f$, with weights determined by the lengths of the pieces. The integral is obtained by letting the number of pieces go to infinity. 

(Food for thought: do the sizes of the pieces need to be uniform?)

One subtlety in the previous paragraph lies in the phrase "take a path from $x_1$ to $x_2$". In $\mathbb{C}$, the first problem we encounter is that there are infinitely many paths from $z_1$ to $z_2$. It is not clear whether the value of our integral should depend on the chosen path. Thus, to begin with, we take an intergral in $\mathbb{C}$ *with respect to*, or *over*, a particular path (called a *contour*). 

The rest is pretty much the same. We break the selected path into pieces. Then we evaluate $g$ at each piece. Finally, we calculate a weighted sum of the results. This time, the weights $\Delta{z_k}$, is the displacement *across a piece*, expressed as a complex number. The integral is obtained by letting the number of pieces go to infinity. 

![Complex Riemann sum](assets/complex-riemann-sum.gif)

Above is a crude Riemann sum for $\int_{\gamma}z^2\,dz$, where the contour $\gamma$ is parametrized by $z(t) = t + i(t + 0.35\sin(\pi{t}))$ for $t \in [0, 1]$. How we split the contour into parts is determined by the step size $\Delta{t} = 0.25$; that is, the $k$-th part is parametrized by $z(t)$ for $t \in [0.25(k - 1), 0.25k)$. Let's try evaluating this very crude Riemann sum. We'll see how it compares to the value of the integral at the end.

(Additional food for thought: we split the contour $\gamma$ into parts at the points $z(0.25)$, $z(0.5)$, $z(0.75)$. As a result, each part has a different length in the complex plane. Alternatively, we could have split the contour into parts of equal length, as in the real case. Does the approach we take affect the eventual value of the integral, when we let the number of parts go to infinity? Why or why not?)

<style>
.rw-module { margin: 2.5em 0 1em; }
.rw-step {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.2em 1.4em;
  margin-bottom: 1.3em;
  background: #fafafa;
  transition: opacity 0.5s ease;
}
.rw-step.rw-locked {
  opacity: 0.35;
  pointer-events: none;
  user-select: none;
}
.rw-step h3 { margin: 0 0 0.15em; font-size: 1.05em; font-weight: 600; }
.rw-hint {
  font-size: 0.82em;
  color: #777;
  font-style: italic;
  margin: 0.15em 0 0.9em;
}
.rw-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5em 1.4em;
  margin-bottom: 0.9em;
}
@media (max-width: 480px) { .rw-grid { grid-template-columns: 1fr; } }
.rw-row { display: flex; align-items: center; gap: 0.4em; }
.rw-label {
  min-width: 5.5em;
  text-align: right;
  white-space: nowrap;
  font-size: 0.95em;
}
.rw-input {
  flex: 1;
  padding: 0.35em 0.5em;
  border: 1.5px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9em;
  min-width: 0;
  box-sizing: border-box;
  transition: border-color 0.3s, background 0.3s;
}
.rw-input:focus {
  outline: none;
  border-color: #245;
  box-shadow: 0 0 0 2px rgba(34,68,85,0.1);
}
.rw-input.rw-ok { border-color: #2a7a2a; background: #eef7ee; }
.rw-input.rw-err { border-color: #c33; background: #fdf0f0; }
.rw-btn {
  padding: 0.45em 1.5em;
  background: #245;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.88em;
}
.rw-btn:hover { background: #367; }
.rw-btn:active { background: #134; }
.rw-feedback { margin-top: 0.7em; font-size: 0.87em; line-height: 1.7; }
.rw-fb-item { margin: 0.15em 0; }
.rw-fb-ok { color: #2a7a2a; }
.rw-fb-err { color: #c33; }
.rw-fb-summary { font-weight: 600; margin-bottom: 0.3em; }
.rw-done {
  margin-top: 1.2em;
  padding: 1em 1.2em;
  border: 1px solid #b5d5b5;
  border-radius: 8px;
  background: #f0f8f0;
  font-size: 0.9em;
  line-height: 1.6;
  display: none;
}
</style>

<div class="rw-module">

<div class="rw-step" id="rw-q1">
<h3>Step 1: Identify $z_1, z_2, z_3, z_4$</h3>
<p class="rw-hint">Evaluate $z(t)$ at the left endpoints $t = 0,\; 0.25,\; 0.5,\; 0.75$. Round to 2 decimal places.</p>
<div class="rw-grid">
<div class="rw-row"><span class="rw-label">$z_1 =$</span><input class="rw-input" id="rw-q1-1" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$z_2 =$</span><input class="rw-input" id="rw-q1-2" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$z_3 =$</span><input class="rw-input" id="rw-q1-3" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$z_4 =$</span><input class="rw-input" id="rw-q1-4" placeholder="a + bi"></div>
</div>
<button class="rw-btn" onclick="rwCheck(1)">Check</button>
<div class="rw-feedback" id="rw-fb-1"></div>
</div>

<div class="rw-step rw-locked" id="rw-q2">
<h3>Step 2: Compute $g(z_1), g(z_2), g(z_3), g(z_4)$</h3>
<p class="rw-hint">Recall $g(z) = z^2$. Square each $z_k$ from Step 1. Round to 2 decimal places.</p>
<div class="rw-grid">
<div class="rw-row"><span class="rw-label">$g(z_1) =$</span><input class="rw-input" id="rw-q2-1" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$g(z_2) =$</span><input class="rw-input" id="rw-q2-2" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$g(z_3) =$</span><input class="rw-input" id="rw-q2-3" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$g(z_4) =$</span><input class="rw-input" id="rw-q2-4" placeholder="a + bi"></div>
</div>
<button class="rw-btn" onclick="rwCheck(2)">Check</button>
<div class="rw-feedback" id="rw-fb-2"></div>
</div>

<div class="rw-step rw-locked" id="rw-q3">
<h3>Step 3: Compute $\Delta z_1, \Delta z_2, \Delta z_3, \Delta z_4$</h3>
<p class="rw-hint">$\Delta z_k = z(t_k) - z(t_{k-1})$, the complex displacement across each piece. Round to 2 decimal places.</p>
<div class="rw-grid">
<div class="rw-row"><span class="rw-label">$\Delta z_1 =$</span><input class="rw-input" id="rw-q3-1" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$\Delta z_2 =$</span><input class="rw-input" id="rw-q3-2" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$\Delta z_3 =$</span><input class="rw-input" id="rw-q3-3" placeholder="a + bi"></div>
<div class="rw-row"><span class="rw-label">$\Delta z_4 =$</span><input class="rw-input" id="rw-q3-4" placeholder="a + bi"></div>
</div>
<button class="rw-btn" onclick="rwCheck(3)">Check</button>
<div class="rw-feedback" id="rw-fb-3"></div>
</div>

<div class="rw-step rw-locked" id="rw-q4">
<h3>Step 4: Evaluate $\displaystyle\sum_{k=1}^{4} g(z_k)\,\Delta z_k$</h3>
<p class="rw-hint">Multiply and add the results from Steps 2 and 3. Round to 2 decimal places.</p>
<div class="rw-row" style="max-width:22em;margin-bottom:0.9em">
<span class="rw-label" style="min-width:auto;font-style:italic">Answer:</span>
<input class="rw-input" id="rw-q4-1" placeholder="a + bi">
</div>
<button class="rw-btn" onclick="rwCheck(4)">Check</button>
<div class="rw-feedback" id="rw-fb-4"></div>
</div>

<div class="rw-done" id="rw-done"></div>

</div>

<script>
(function() {
  'use strict';

  function curve(t) {
    return [t, t + 0.35 * Math.sin(Math.PI * t)];
  }
  function csq(re, im) { return [re * re - im * im, 2 * re * im]; }
  function cmul(a, b) {
    return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  }

  var N = 4;
  var pts = [];
  for (var k = 0; k <= N; k++) pts.push(curve(k / N));

  var zk  = pts.slice(0, N);
  var gzk = zk.map(function(z) { return csq(z[0], z[1]); });
  var dzk = [];
  for (var k = 0; k < N; k++)
    dzk.push([pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]]);

  var total = [0, 0];
  for (var k = 0; k < N; k++) {
    var p = cmul(gzk[k], dzk[k]);
    total[0] += p[0];
    total[1] += p[1];
  }

  var answers = [zk, gzk, dzk, [total]];
  var tols    = [0.03, 0.04, 0.03, 0.08];
  var qLabels = [
    ['z_1', 'z_2', 'z_3', 'z_4'],
    ['g(z_1)', 'g(z_2)', 'g(z_3)', 'g(z_4)'],
    ['\\Delta z_1', '\\Delta z_2', '\\Delta z_3', '\\Delta z_4'],
    ['\\textstyle\\sum']
  ];
  var qOk = [false, false, false, false];

  function parseC(s) {
    s = s.replace(/\s/g, '').replace(/\*/g, '').replace(/j/gi, 'i');
    if (!s) return null;
    if (!/i/.test(s)) {
      var v = parseFloat(s);
      return isNaN(v) ? null : [v, 0];
    }
    var idx = s.indexOf('i');
    var pre = s.substring(0, idx);
    if (pre === '' || pre === '+') return [0, 1];
    if (pre === '-') return [0, -1];
    var sp = -1;
    for (var j = pre.length - 1; j > 0; j--) {
      if ((pre[j] === '+' || pre[j] === '-') &&
          pre[j - 1] !== 'e' && pre[j - 1] !== 'E') {
        sp = j;
        break;
      }
    }
    if (sp === -1) {
      var im = parseFloat(pre);
      return isNaN(im) ? null : [0, im];
    }
    var re = parseFloat(pre.substring(0, sp));
    var imStr = pre.substring(sp);
    var im2;
    if (imStr === '+') im2 = 1;
    else if (imStr === '-') im2 = -1;
    else im2 = parseFloat(imStr);
    return (isNaN(re) || isNaN(im2)) ? null : [re, im2];
  }

  function fmtC(z) {
    var r  = Math.round(z[0] * 10000) / 10000;
    var i  = Math.round(z[1] * 10000) / 10000;
    var ai = Math.abs(i);
    if (ai < 1e-8 && Math.abs(r) < 1e-8) return '0';
    if (ai < 1e-8) return '' + r;
    if (Math.abs(r) < 1e-8) {
      if (Math.abs(ai - 1) < 1e-8) return (i > 0 ? '' : '-') + 'i';
      return i + 'i';
    }
    var ip = (Math.abs(ai - 1) < 1e-8) ? '' : ai;
    return r + (i > 0 ? ' + ' : ' - ') + ip + 'i';
  }

  function kstr(tex) {
    try { return katex.renderToString(tex, { throwOnError: false }); }
    catch (e) { return tex; }
  }

  window.rwCheck = function(q) {
    var ans    = answers[q - 1];
    var tol    = tols[q - 1];
    var n      = ans.length;
    var labels = qLabels[q - 1];
    var fb     = document.getElementById('rw-fb-' + q);
    var allOk  = true;
    var html   = '';

    for (var k = 0; k < n; k++) {
      var inp     = document.getElementById('rw-q' + q + '-' + (k + 1));
      var val     = parseC(inp.value);
      var correct = ans[k];

      if (!val) {
        inp.className = 'rw-input rw-err';
        html += '<div class="rw-fb-item rw-fb-err">\u2717 ' +
          kstr(labels[k]) + ' \u2014 could not parse input</div>';
        allOk = false;
        continue;
      }

      var ok = Math.abs(val[0] - correct[0]) < tol &&
               Math.abs(val[1] - correct[1]) < tol;
      inp.className = 'rw-input ' + (ok ? 'rw-ok' : 'rw-err');

      if (ok) {
        html += '<div class="rw-fb-item rw-fb-ok">\u2713 ' +
          kstr(labels[k] + ' = ' + fmtC(correct)) + '</div>';
      } else {
        html += '<div class="rw-fb-item rw-fb-err">\u2717 ' +
          kstr(labels[k]) + ' \u2014 expected ' +
          kstr(fmtC(correct)) + '</div>';
        allOk = false;
      }
    }

    if (allOk) {
      html = '<div class="rw-fb-summary rw-fb-ok">All correct!</div>' + html;
    }
    fb.innerHTML = html;
    qOk[q - 1] = allOk;

    if (allOk && q < 4) {
      document.getElementById('rw-q' + (q + 1)).classList.remove('rw-locked');
    }

    if (qOk[0] && qOk[1] && qOk[2] && qOk[3]) {
      var done = document.getElementById('rw-done');
      done.innerHTML =
        'Our crude Riemann sum gives ' + kstr(fmtC(total)) +
        '. The exact value of ' + kstr('\\int_{\\gamma} z^2\\,dz') +
        ' is ' + kstr('-\\tfrac{2}{3} + \\tfrac{2}{3}i') +
        'With only 4 pieces the estimate is rough, but it converges as the partition gets finer.';
      done.style.display = 'block';
      renderMathInElement(done, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }
  };

  var inputs = document.querySelectorAll('.rw-input');
  for (var i = 0; i < inputs.length; i++) {
    (function(inp) {
      var q = parseInt(inp.id.match(/q(\d)/)[1]);
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') window.rwCheck(q);
      });
    })(inputs[i]);
  }
})();
</script>