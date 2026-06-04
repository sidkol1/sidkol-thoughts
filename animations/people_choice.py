from manim import *


class PeopleChoice(Scene):
    def construct(self):
        N_BENEFIT = 12  # left group
        N_HARM = 12      # right group
        N = N_BENEFIT + N_HARM

        # Of those who would be harmed, a MAJORITY elect to make it illegal.
        # Of those who would benefit, only a MINORITY elect to make it illegal.
        HARM_ILLEGAL = 9
        BENEFIT_ILLEGAL = 3

        title = Text("People who take the action", font_size=30).to_edge(UP, buff=0.7)

        dots = VGroup(*[Dot(radius=0.13, color=BLUE_D) for _ in range(N)])
        dots.arrange_in_grid(rows=4, buff=0.35).move_to(DOWN * 0.2)

        self.play(Write(title), run_time=0.8)
        self.play(
            LaggedStart(*[GrowFromCenter(d) for d in dots], lag_ratio=0.04),
            run_time=1.5,
        )
        self.wait(0.5)

        benefitted = VGroup(*dots[:N_BENEFIT])
        harmed = VGroup(*dots[N_BENEFIT:])

        self.play(
            benefitted.animate.set_color(GREEN),
            harmed.animate.set_color(RED),
            run_time=0.8,
        )
        self.wait(0.3)

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

        left_label = Text("would be benefitted", font_size=26, color=GREEN).next_to(
            left_target, UP, buff=0.45
        )
        right_label = Text("would be harmed", font_size=26, color=RED).next_to(
            right_target, UP, buff=0.45
        )
        self.play(FadeIn(left_label, shift=UP * 0.2), FadeIn(right_label, shift=UP * 0.2), run_time=0.8)
        self.wait(0.6)

        # Highlight those who would elect to make the action illegal for themselves.
        elect_illegal = [*harmed[:HARM_ILLEGAL], *benefitted[:BENEFIT_ILLEGAL]]
        rings = VGroup(
            *[
                Circle(radius=0.22, color=GOLD, stroke_width=4).move_to(d.get_center())
                for d in elect_illegal
            ]
        )

        legend = Text(
            "circled = would choose to make it illegal for themselves",
            font_size=24,
            color=GOLD,
        ).to_edge(DOWN, buff=0.55)

        self.play(
            LaggedStart(*[Create(r) for r in rings], lag_ratio=0.06),
            FadeIn(legend),
            run_time=2.2,
        )
        self.wait(2.5)
