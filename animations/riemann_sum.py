from manim import *


class RiemannSum(Scene):
    def construct(self):
        N = 6
        a, b = 0, 3
        dx = 0.5
        f = lambda x: 2 * x
        COLORS = [RED, ORANGE, GOLD_D, GREEN, TEAL, BLUE]

        # (i) f label in top-left from the start
        f_label = MathTex(r"f(x) = 2x").scale(0.55).to_corner(UL, buff=0.4)
        self.add(f_label)

        # Number line
        nl = NumberLine(
            x_range=[-0.5, 3.5, 0.5],
            length=10,
            include_numbers=False,
            include_ticks=True,
            tick_size=0.06,
        ).shift(UP * 2.5)
        for val in range(4):
            nl.add(
                MathTex(str(val)).scale(0.4)
                .next_to(nl.n2p(val), DOWN, buff=0.1)
            )
        self.add(nl)

        # Phase 1: the stick
        stick = Line(nl.n2p(0), nl.n2p(3), color=YELLOW, stroke_width=14)
        self.play(Create(stick), run_time=1.2)
        self.wait(0.8)

        # Phase 2: split on the number line
        segs = VGroup(*[
            Line(nl.n2p(a + i * dx), nl.n2p(a + (i + 1) * dx),
                 color=COLORS[i], stroke_width=14)
            for i in range(N)
        ])
        cuts = VGroup(*[
            Line(nl.n2p(a + i * dx) + UP * 0.15,
                 nl.n2p(a + i * dx) + DOWN * 0.15,
                 stroke_width=1.5, color=WHITE)
            for i in range(1, N)
        ])
        self.play(
            FadeOut(stick),
            LaggedStart(*[GrowFromCenter(s) for s in segs], lag_ratio=0.06),
            LaggedStart(*[Create(c) for c in cuts], lag_ratio=0.06),
            run_time=1.5,
        )

        # (iii) Δx brace ABOVE the number line
        dx_brace = BraceBetweenPoints(
            nl.n2p(0) + UP * 0.2, nl.n2p(dx) + UP * 0.2, direction=UP
        ).scale(0.85)
        dx_tex = MathTex(r"\Delta x").scale(0.4).next_to(dx_brace, UP, buff=0.05)
        self.play(GrowFromCenter(dx_brace), Write(dx_tex), run_time=0.7)
        self.wait(0.5)

        # (ii) Separate segments: move off the line, down and apart
        seg_len = abs(nl.n2p(dx)[0] - nl.n2p(0)[0])
        gap = 0.25
        sep_y = 0.3
        total_w = N * seg_len + (N - 1) * gap
        left_x = -total_w / 2

        move_anims = []
        for i in range(N):
            cx = left_x + i * (seg_len + gap) + seg_len / 2
            move_anims.append(segs[i].animate.move_to(np.array([cx, sep_y, 0])))

        self.play(*move_anims, FadeOut(cuts), run_time=1.5)
        self.wait(0.3)

        # Phase 3: arrows from each segment to its f-value
        fvals = [int(f(a + i * dx)) for i in range(N)]

        arrows = VGroup()
        val_labels = VGroup()
        for i in range(N):
            bot = segs[i].get_center() + DOWN * 0.1

            val = MathTex(str(fvals[i]), color=COLORS[i]).scale(0.55)
            val.move_to(segs[i].get_center() + DOWN * 1.5)
            val_labels.add(val)

            arr = Arrow(
                bot, val.get_top() + UP * 0.08,
                color=COLORS[i], stroke_width=2, buff=0.05,
                max_tip_length_to_length_ratio=0.2,
            )
            arrows.add(arr)

        for i in range(N):
            self.play(GrowArrow(arrows[i]), Write(val_labels[i]), run_time=0.35)
        self.wait(0.5)

        # (iv) Weighted sum with larger font
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
            tex.scale(0.65)
            terms.append(tex)

        eq = MathTex("=", "7.5").scale(0.7)
        row = VGroup(*terms, eq).arrange(RIGHT, buff=0.12)
        row.next_to(val_labels, DOWN, buff=0.8)

        for i, tex in enumerate(terms):
            flash = segs[i].copy().set_stroke(width=22, opacity=0.8)
            self.play(Write(tex), FadeIn(flash), run_time=0.45)
            self.play(FadeOut(flash), run_time=0.12)

        self.play(Write(eq), run_time=0.6)
        self.wait(2)
