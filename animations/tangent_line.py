from manim import *


class TangentLine(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 5, 1],
            x_length=8,
            y_length=6,
            axis_config={"include_ticks": True, "include_tip": True},
        )
        labels = axes.get_axis_labels(x_label="x", y_label="y")

        graph = axes.plot(lambda x: x**2, x_range=[-2.2, 2.2], color=BLUE)

        self.add(axes, labels, graph)

        t = ValueTracker(0)

        dot = always_redraw(
            lambda: Dot(axes.c2p(t.get_value(), t.get_value() ** 2), color=YELLOW)
        )

        tangent = always_redraw(lambda: axes.plot(
            lambda x: 2 * t.get_value() * (x - t.get_value()) + t.get_value() ** 2,
            x_range=[t.get_value() - 1.5, t.get_value() + 1.5],
            color=RED,
        ))

        self.add(dot, tangent)
        self.play(t.animate.set_value(2), run_time=4, rate_func=smooth)
        self.play(t.animate.set_value(0), run_time=4, rate_func=smooth)
        self.wait()
