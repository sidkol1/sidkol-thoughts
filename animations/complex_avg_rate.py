from manim import *
import numpy as np


class ComplexAvgRate(Scene):
    def construct(self):
        z0 = np.array([1, 1])  # 1 + i

        plane = ComplexPlane(
            x_range=[-3, 4, 1],
            y_range=[-3, 4, 1],
            x_length=8,
            y_length=8,
            background_line_style={"stroke_opacity": 0},
            faded_line_style={"stroke_opacity": 0},
            axis_config={"include_ticks": True, "include_tip": True},
        )
        plane.add_coordinates()

        z0_dot = Dot(plane.n2p(complex(*z0)), color=YELLOW, z_index=1)
        z0_label = MathTex("z_0", color=YELLOW).next_to(z0_dot, DOWN + LEFT * 0.5)

        self.play(Create(plane))
        self.play(FadeIn(z0_dot), FadeIn(z0_label))

        wx = ValueTracker(3)
        wy = ValueTracker(0)

        w_dot = always_redraw(
            lambda: Dot(
                plane.n2p(complex(wx.get_value(), wy.get_value())),
                color=RED,
                z_index=1,
            )
        )
        w_label = always_redraw(
            lambda: MathTex("z", color=RED).next_to(
                plane.n2p(complex(wx.get_value(), wy.get_value())),
                DOWN + LEFT * 0.5,
            )
        )

        def rate_text():
            re = wx.get_value() + z0[0]
            im = wy.get_value() + z0[1]
            sign = "+" if im >= 0 else "-"
            return MathTex(
                r"\frac{\Delta g}{\Delta z} = " + f"{re:.2f} {sign} {abs(im):.2f}i",
                color=WHITE,
            ).to_corner(UR)

        rate_label = always_redraw(rate_text)

        self.play(FadeIn(w_dot), FadeIn(w_label), FadeIn(rate_label))
        self.wait(0.5)

        self.play(wx.animate.set_value(1.2), wy.animate.set_value(1.2), run_time=3, rate_func=smooth)
        self.wait(0.3)
        self.play(wx.animate.set_value(-1), wy.animate.set_value(2), run_time=3, rate_func=smooth)
        self.wait(0.3)
        self.play(wx.animate.set_value(2), wy.animate.set_value(-1), run_time=3, rate_func=smooth)
        self.wait(0.3)
        self.play(wx.animate.set_value(1.05), wy.animate.set_value(1.05), run_time=3, rate_func=smooth)
        self.wait()
