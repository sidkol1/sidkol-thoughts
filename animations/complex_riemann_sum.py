from manim import *
import numpy as np


class ComplexRiemannSum(Scene):
    def construct(self):
        N = 4
        COLORS = [RED, ORANGE, GREEN, TEAL]

        def curve_math(t):
            return np.array([t, t + 0.35 * np.sin(np.pi * t), 0])

        g_label = MathTex(r"g(z) = z^2").scale(0.65).to_corner(UL, buff=0.4)
        self.add(g_label)

        axes = Axes(
            x_range=[-0.3, 1.5, 0.5],
            y_range=[-0.3, 1.6, 0.5],
            x_length=5,
            y_length=5.5,
            axis_config={"stroke_width": 1.5, "include_ticks": True, "tick_size": 0.05},
        ).shift(UP * 0.8)

        re_lab = MathTex(r"\mathrm{Re}").scale(0.45).next_to(axes.x_axis.get_end(), DR, buff=0.05)
        im_lab = MathTex(r"\mathrm{Im}").scale(0.45).next_to(axes.y_axis.get_end(), UL, buff=0.05)

        contour = ParametricFunction(
            lambda t: axes.c2p(curve_math(t)[0], curve_math(t)[1]),
            t_range=[0, 1],
            color=YELLOW,
            stroke_width=5,
        )

        lab_0 = MathTex("0").scale(0.5).next_to(axes.c2p(0, 0), DL, buff=0.1)
        lab_1i = MathTex("1+i").scale(0.5).next_to(axes.c2p(1, 1), UR, buff=0.1)

        gamma_lab = MathTex(r"\gamma", color=YELLOW).scale(0.55)
        gamma_lab.move_to(contour.point_from_proportion(0.45) + LEFT * 0.4)

        self.add(axes, re_lab, im_lab, contour, lab_0, lab_1i, gamma_lab)
        self.wait(2.0)

        # Axes fade
        self.play(
            FadeOut(axes), FadeOut(re_lab), FadeOut(im_lab),
            FadeOut(lab_0), FadeOut(lab_1i), FadeOut(gamma_lab),
            run_time=1.2,
        )
        self.wait(0.5)

        # Curved arc segments with small gaps
        trim = 0.02

        def make_arc(i):
            return ParametricFunction(
                lambda t: axes.c2p(curve_math(t)[0], curve_math(t)[1]),
                t_range=[i / N + trim, (i + 1) / N - trim],
                color=COLORS[i],
                stroke_width=5,
            )

        segs = VGroup(*[make_arc(i) for i in range(N)])

        self.play(FadeOut(contour), FadeIn(segs), run_time=1.5)
        self.wait(0.5)

        # Boundary points (untrimmed) for Δz arrow later
        boundary_pts = [
            np.array(axes.c2p(curve_math(k / N)[0], curve_math(k / N)[1]))
            for k in range(N + 1)
        ]

        # g(z_k) labels positioned using curve tangent normals in Manim space
        g_tex = [r"g(z_1)", r"g(z_2)", r"g(z_3)", r"g(z_4)"]

        val_labels = VGroup()
        for i in range(N):
            mid_t = (i + 0.5) / N
            dt = 0.001
            p_b = np.array(axes.c2p(curve_math(mid_t - dt)[0], curve_math(mid_t - dt)[1]))
            p_a = np.array(axes.c2p(curve_math(mid_t + dt)[0], curve_math(mid_t + dt)[1]))
            tangent = p_a - p_b
            tangent_n = tangent / np.linalg.norm(tangent)
            normal = np.array([-tangent_n[1], tangent_n[0], 0])

            v = MathTex(g_tex[i], color=COLORS[i]).scale(0.5)
            v.move_to(segs[i].point_from_proportion(0.5) + normal * 0.55)
            val_labels.add(v)

        self.play(
            LaggedStart(*[Write(v) for v in val_labels], lag_ratio=0.2),
            run_time=2.5,
        )
        self.wait(0.5)

        # Δz_k arrow (straight chord, since displacement is vector-like)
        ex = 1
        arr_s = boundary_pts[ex]
        arr_e = boundary_pts[ex + 1]
        chord = arr_e - arr_s
        chord_n = chord / np.linalg.norm(chord)
        chord_perp = np.array([-chord_n[1], chord_n[0], 0])

        offset = -chord_perp * 0.3
        dz_arrow = Arrow(
            arr_s + offset, arr_e + offset,
            color=WHITE, stroke_width=2, buff=0,
            max_tip_length_to_length_ratio=0.15,
        )
        dz_tex = MathTex(r"\Delta z_k").scale(0.5)
        dz_tex.next_to(dz_arrow.get_center(), -chord_perp, buff=0.15)

        self.play(GrowArrow(dz_arrow), Write(dz_tex), run_time=1.0)
        self.wait(0.8)

        # Symbolic sum
        sum_terms = [
            MathTex(r"g(z_1)\,\Delta z_1", color=COLORS[0]),
            MathTex(r"+\;g(z_2)\,\Delta z_2", color=COLORS[1]),
            MathTex(r"+\;g(z_3)\,\Delta z_3", color=COLORS[2]),
            MathTex(r"+\;g(z_4)\,\Delta z_4", color=COLORS[3]),
        ]
        for t in sum_terms:
            t.scale(0.7)

        row = VGroup(*sum_terms).arrange(RIGHT, buff=0.15)
        row.to_edge(DOWN, buff=0.7)

        for i, tex in enumerate(sum_terms):
            flash = segs[i].copy().set_stroke(width=12, opacity=0.8)
            self.play(Write(tex), FadeIn(flash), run_time=0.7)
            self.play(FadeOut(flash), run_time=0.2)

        self.wait(2.5)
