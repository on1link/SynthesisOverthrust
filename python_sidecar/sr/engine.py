# ============================================================
# SynthesisOverthrust — sr/engine.py
# FSRS spaced-repetition engine (py-fsrs 6.x wrapper).
#
# Ratings: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
# States (fsrs.State): 1 = Learning, 2 = Review, 3 = Relearning
# ============================================================

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from fsrs import Card, Rating, Scheduler

# Default scheduler: FSRS-6 default parameters, 90% desired retention.
# Fuzzing on in production; tests pass their own Scheduler(enable_fuzzing=False).
DEFAULT_SCHEDULER = Scheduler(desired_retention=0.9)


def _now() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class SRCard:
    """Scheduling state for one (user, topic_item) card."""
    id:          str
    user_id:     str
    item_id:     int                       # topic_items.id — lowest mastery unit
    stability:   Optional[float] = None
    difficulty:  Optional[float] = None
    fsrs_state:  int   = 1                 # fsrs.State value
    step:        int   = 0
    repetitions: int   = 0
    lapses:      int   = 0
    due_at:      datetime = field(default_factory=_now)
    last_review: Optional[datetime] = None


@dataclass
class ReviewResult:
    card_id:         str
    rating:          int         # 1-4
    prev_stability:  Optional[float]
    new_stability:   Optional[float]
    prev_difficulty: Optional[float]
    new_difficulty:  Optional[float]
    due_at:          datetime
    interval_days:   int
    again:           bool        # True if rating == Again


def _to_fsrs(card: SRCard) -> Card:
    return Card(
        card_id     = abs(hash(card.id)),   # py-fsrs wants an int id; unused by us
        state       = card.fsrs_state,
        step        = card.step if card.fsrs_state in (1, 3) else None,
        stability   = card.stability,
        difficulty  = card.difficulty,
        due         = card.due_at,
        last_review = card.last_review,
    )


def new_card_schedule(card: SRCard) -> SRCard:
    """Fresh card: Learning state, due immediately."""
    card.stability   = None
    card.difficulty  = None
    card.fsrs_state  = 1
    card.step        = 0
    card.repetitions = 0
    card.lapses      = 0
    card.due_at      = _now()
    card.last_review = None
    return card


def review_card(
    card: SRCard,
    rating: int,
    scheduler: Scheduler = DEFAULT_SCHEDULER,
    now: Optional[datetime] = None,
) -> ReviewResult:
    """Apply one FSRS review. Mutates card in place, returns the transition."""
    if rating not in (1, 2, 3, 4):
        raise ValueError(f"rating must be 1-4 (Again/Hard/Good/Easy), got {rating}")

    now = now or _now()
    prev_s, prev_d = card.stability, card.difficulty

    updated, _log = scheduler.review_card(_to_fsrs(card), Rating(rating), review_datetime=now)

    card.stability   = updated.stability
    card.difficulty  = updated.difficulty
    card.fsrs_state  = int(updated.state)
    card.step        = updated.step if updated.step is not None else 0
    card.due_at      = updated.due
    card.last_review = now
    card.repetitions += 1
    if rating == 1:
        card.lapses += 1

    return ReviewResult(
        card_id         = card.id,
        rating          = rating,
        prev_stability  = prev_s,
        new_stability   = card.stability,
        prev_difficulty = prev_d,
        new_difficulty  = card.difficulty,
        due_at          = card.due_at,
        interval_days   = max(0, (card.due_at - now).days),
        again           = rating == 1,
    )
