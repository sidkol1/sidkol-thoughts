from manim import *


class RiemannSum(Scene):
    def construct(self):
        N = 6
        a, b = 0, 3
        dx = 0.5
        f = lambda x: 2 * x
        COLORS = [RED, ORANGE, GOLD_D, GREEN, TEAL, BLUE]

        f_label = MathTex(r"f(x) = 2x").scale(0.55).to_corner(UL, buff=0.4)

        nl = NumberLine(
            x_range=[-0.5, 3.5, 0.5],
            length=10,
            include_numbers=False,
            include_ticks=True,
            tick_size=0.06,
        ).shift(UP * 1.5)

        x1_lab = MathTex("0").scale(0.45).next_to(nl.n2p(0), DOWN, buff=0.15)
        x2_lab = MathTex("3").scale(0.45).next_to(nl.n2p(3), DOWN, buff=0.15)

        stick = Line(nl.n2p(0), nl.n2p(3), color=YELLOW, stroke_width=14)

        self.add(f_label, nl, x1_lab, x2_lab, stick)
        self.wait(1.5)

        # Number line disappears
        self.play(FadeOut(nl), FadeOut(x1_lab), FadeOut(x2_lab), run_time=0.8)
        self.wait(0.3)

        # Break stick into colored segments
        stick_left = stick.get_left()
        seg_unit = stick.get_length() / N

        segs = VGroup(*[
            Line(
                stick_left + RIGHT * i * seg_unit,
                stick_left + RIGHT * (i + 1) * seg_unit,
                color=COLORS[i], stroke_width=14,
            )
            for i in range(N)
        ])

        self.remove(stick)
        self.add(segs)

        # Separate with gaps
        gap = 0.2
        total_w = N * seg_unit + (N - 1) * gap
        left_x = -total_w / 2
        seg_y = 1.5

        move_anims = []
        for i in range(N):
            cx = left_x + i * (seg_unit + gap) + seg_unit / 2
            move_anims.append(segs[i].animate.move_to(np.array([cx, seg_y, 0])))

        self.play(*move_anims, run_time=1.2)
        self.wait(0.3)

        # f-values above each part (left-endpoint values)
        fvals = [int(f(a + i * dx)) for i in range(N)]
        val_labels = VGroup()
        for i in range(N):
            val = MathTex(str(fvals[i]), color=COLORS[i]).scale(0.6)
            val.next_to(segs[i], UP, buff=0.25)
            val_labels.add(val)

        self.play(
            LaggedStart(*[Write(v) for v in val_labels], lag_ratio=0.1),
            run_time=1.5,
        )
        self.wait(0.3)

        # Δx = 0.5 below one part
        dx_brace = BraceBetweenPoints(
            segs[0].get_left() + DOWN * 0.15,
            segs[0].get_right() + DOWN * 0.15,
            direction=DOWN,
        )
        dx_tex = MathTex(r"\Delta x = 0.5").scale(0.45).next_to(dx_brace, DOWN, buff=0.08)
        self.play(GrowFromCenter(dx_brace), Write(dx_tex), run_time=0.7)
        self.wait(0.5)

        # Assemble sum in large font
        terms = []
        for i in range(N):
            if i == 0:
                tex = MathTex(
                    str(fvals[i]), r"\!\cdot\!", r"\tfrac{1}{2}",
                    color=COLORS[i],
                )
            else:
                tex = MathTex(
                    r"+\,", str(fvals[i]), r"\!\cdot\!", r"\tfrac{1}{2}",
                    color=COLORS[i],
                )
            tex.scale(0.8)
            terms.append(tex)

        eq = MathTex("=", "7.5").scale(0.85)
        row = VGroup(*terms, eq).arrange(RIGHT, buff=0.12)
        row.next_to(VGroup(segs, dx_brace, dx_tex), DOWN, buff=0.9)

        for i, tex in enumerate(terms):
            flash = segs[i].copy().set_stroke(width=22, opacity=0.8)
            self.play(Write(tex), FadeIn(flash), run_time=0.45)
            self.play(FadeOut(flash), run_time=0.12)

        self.play(Write(eq), run_time=0.6)
        self.wait(2)
