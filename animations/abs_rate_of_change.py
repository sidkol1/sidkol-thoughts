from manim import *


class AbsRateOfChange(Scene):
    def construct(self):
        x0 = 0

        number_line = NumberLine(
            x_range=[-4, 4, 1],
            length=10,
            include_numbers=True,
            include_tip=True,
        )

        x0_dot = Dot(number_line.n2p(x0), color=YELLOW, z_index=1)
        x0_label = MathTex("x_0", color=YELLOW).next_to(x0_dot, DOWN + LEFT * 0.5)

        self.add(number_line)
        self.play(FadeIn(x0_dot), FadeIn(x0_label))

        t_val = ValueTracker(3)

        t_dot = always_redraw(
            lambda: Dot(number_line.n2p(t_val.get_value()), color=RED, z_index=1)
        )
        t_label = always_redraw(
            lambda: MathTex("x", color=RED).next_to(
                number_line.n2p(t_val.get_value()), DOWN + LEFT * 0.5
            )
        )

        # f(x) = |x|, x0 = 0, so (|x| - |0|) / (x - 0) = |x|/x = sign(x)
        rate_label = always_redraw(lambda: MathTex(
            r"\frac{\Delta f}{\Delta x} = " + (
                "1.00" if t_val.get_value() > 0.01
                else "-1.00" if t_val.get_value() < -0.01
                else "\\text{undefined}"
            ),
            color=WHITE,
        ).to_corner(UR))

        self.add(t_dot, t_label, rate_label)
        self.wait(0.5)

        self.play(t_val.animate.set_value(0.3), run_time=3, rate_func=smooth)
        self.wait(0.5)
        self.play(t_val.animate.set_value(-3), run_time=3, rate_func=smooth)
        self.wait(0.5)
        self.play(t_val.animate.set_value(-0.3), run_time=3, rate_func=smooth)
        self.wait(0.5)
        self.play(t_val.animate.set_value(2), run_time=2, rate_func=smooth)
        self.wait()
