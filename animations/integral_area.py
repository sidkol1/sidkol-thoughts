from manim import *


class IntegralArea(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-0.5, 3.5, 1],
            y_range=[-1, 7, 1],
            x_length=8,
            y_length=6,
            axis_config={"include_ticks": True, "include_tip": True},
        )
        labels = axes.get_axis_labels(x_label="x", y_label="y")
        graph = axes.plot(lambda x: 2 * x, x_range=[-0.5, 3.3], color=BLUE)

        t = ValueTracker(2)

        area = always_redraw(
            lambda: axes.get_area(
                graph,
                x_range=[0, max(t.get_value(), 0.01)],
                color=BLUE,
                opacity=0.3,
            )
        )

        vert_line = always_redraw(
            lambda: DashedLine(
                axes.c2p(t.get_value(), 0),
                axes.c2p(t.get_value(), 2 * t.get_value()),
                color=YELLOW,
                stroke_width=2,
            )
        )

        t_label = always_redraw(
            lambda: MathTex("t", color=YELLOW)
            .scale(0.8)
            .next_to(axes.c2p(t.get_value(), 0), DOWN, buff=0.2)
        )

        integral_label = always_redraw(
            lambda: MathTex(
                r"\int_0^t 2x\,dx = " + f"{t.get_value()**2:.2f}"
            )
            .scale(0.8)
            .to_corner(UR, buff=0.5)
        )

        self.add(axes, labels, graph, area, vert_line, t_label, integral_label)

        self.play(t.animate.set_value(3), run_time=3, rate_func=smooth)
        self.play(t.animate.set_value(0.2), run_time=4, rate_func=smooth)
        self.play(t.animate.set_value(2), run_time=3, rate_func=smooth)
