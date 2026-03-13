import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import hsv_to_rgb

z0 = complex(1, 1)

x = np.linspace(-3, 4, 800)
y = np.linspace(-3, 4, 800)
X, Y = np.meshgrid(x, y)
W = X + 1j * Y

# (w^2 - z0^2) / (w - z0) = w + z0
val = W + z0

# Domain coloring: hue = argument, brightness = magnitude
hue = (np.angle(val) + np.pi) / (2 * np.pi)
magnitude = np.abs(val)
saturation = np.ones_like(hue)
brightness = 1 - 1 / (1 + magnitude * 0.3)  # sigmoid-ish scaling

hsv = np.stack([hue, saturation, brightness], axis=-1)
rgb = hsv_to_rgb(hsv)

fig, ax = plt.subplots(figsize=(7, 7))
ax.imshow(rgb, extent=[-3, 4, -3, 4], origin="lower")

ax.axhline(0, color="white", linewidth=0.5, alpha=0.4)
ax.axvline(0, color="white", linewidth=0.5, alpha=0.4)
ax.plot(z0.real, z0.imag, "o", color="yellow", markersize=8, zorder=5)
ax.annotate("$z_0$", (z0.real, z0.imag), textcoords="offset points",
            xytext=(-12, -12), color="yellow", fontsize=14)

ax.set_xlabel("Re", fontsize=12)
ax.set_ylabel("Im", fontsize=12)
ax.set_title(r"$\frac{w^2 - z_0^2}{w - z_0} = w + z_0$", fontsize=16)

plt.tight_layout()
plt.savefig("assets/diff-quotient-heatmap.png", dpi=150)
print("Saved to assets/diff-quotient-heatmap.png")
