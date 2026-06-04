from manim import *


class PeopleSplit(Scene):
    def construct(self):
        N_BENEFIT = 12  # left group
        N_HARM = 12      # right group
        N = N_BENEFIT + N_HARM

        title = Text("People who take the action", font_size=30).to_edge(UP, buff=0.7)

        # Initial neutral cluster
        dots = VGroup(*[Dot(radius=0.13, color=BLUE_D) for _ in range(N)])
        dots.arrange_in_grid(rows=4, buff=0.35).move_to(DOWN * 0.2)

        self.play(Write(title), run_time=0.8)
        self.play(
            LaggedStart(*[GrowFromCenter(d) for d in dots], lag_ratio=0.04),
            run_time=1.5,
        )
        self.wait(0.6)

        benefitted = VGroup(*dots[:N_BENEFIT])
        harmed = VGroup(*dots[N_BENEFIT:])

        self.play(
            benefitted.animate.set_color(GREEN),
            harmed.animate.set_color(RED),
            run_time=0.8,
        )
        self.wait(0.3)

        # Target layouts: benefitted left, harmed right
        left_target = (
            benefitted.copy().arrange_in_grid(cols=3, buff=0.34).move_to(LEFT * 3.3 + DOWN * 0.3)
        )
        right_target = (
            harmed.copy().arrange_in_grid(cols=3, buff=0.34).move_to(RIGHT * 3.3 + DOWN * 0.3)
        )

        anims = []
        for d, t in zip(benefitted, left_target):
            anims.append(d.animate.move_to(t.get_center()))
        for d, t in zip(harmed, right_target):
            anims.append(d.animate.move_to(t.get_center()))
        self.play(*anims, run_time=1.6)
        self.wait(0.3)

        left_label = Text("benefitted", font_size=30, color=GREEN).next_to(
            left_target, UP, buff=0.45
        )
        right_label = Text("harmed", font_size=30, color=RED).next_to(
            right_target, UP, buff=0.45
        )
        self.play(FadeIn(left_label, shift=UP * 0.2), FadeIn(right_label, shift=UP * 0.2), run_time=0.8)
        self.wait(2.5)
