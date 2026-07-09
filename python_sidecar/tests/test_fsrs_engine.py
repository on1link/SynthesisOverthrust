# ============================================================
# SynthesisOverthrust — tests/test_fsrs_engine.py
# Unit tests for the FSRS engine wrapper (py-fsrs 6.x).
# Run: uv run pytest tests/ -v
# ============================================================

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from datetime import datetime, timedelta, timezone

import pytest
from fsrs import Scheduler

from sr.engine import SRCard, ReviewResult, new_card_schedule, review_card

# Deterministic scheduler for tests
SCHED = Scheduler(desired_retention=0.9, enable_fuzzing=False)
NOW = datetime(2026, 7, 9, 12, 0, 0, tzinfo=timezone.utc)


def make_card(item_id=1) -> SRCard:
    card = SRCard(id="test-card", user_id="default", item_id=item_id)
    new_card_schedule(card)
    card.due_at = NOW
    return card


# ── Rating validation ─────────────────────────────────────────────────────────
@pytest.mark.parametrize("bad", [0, 5, -1, 99])
def test_invalid_rating_raises(bad):
    with pytest.raises(ValueError):
        review_card(make_card(), bad, scheduler=SCHED, now=NOW)


# ── Fresh card state ──────────────────────────────────────────────────────────
def test_new_card_due_immediately():
    card = make_card()
    assert card.fsrs_state == 1          # Learning
    assert card.stability is None
    assert card.difficulty is None
    assert card.due_at <= NOW            # due as of the fixture clock


# ── First review populates FSRS state ─────────────────────────────────────────
@pytest.mark.parametrize("rating", [1, 2, 3, 4])
def test_first_review_sets_stability_difficulty(rating):
    card = make_card()
    result = review_card(card, rating, scheduler=SCHED, now=NOW)
    assert card.stability is not None and card.stability > 0
    assert card.difficulty is not None and 1 <= card.difficulty <= 10
    assert card.repetitions == 1
    assert result.prev_stability is None
    assert result.new_stability == card.stability


# ── Again vs Easy semantics ───────────────────────────────────────────────────
def test_again_flags_and_lapses():
    card = make_card()
    result = review_card(card, 1, scheduler=SCHED, now=NOW)
    assert result.again is True
    assert card.lapses == 1
    # Learning step: due again within minutes, same day
    assert (card.due_at - NOW) < timedelta(days=1)


def test_easy_graduates_to_review_state():
    card = make_card()
    result = review_card(card, 4, scheduler=SCHED, now=NOW)
    assert result.again is False
    assert card.fsrs_state == 2          # Review
    assert (card.due_at - NOW) >= timedelta(days=1)
    assert result.interval_days >= 1


def test_easy_interval_longer_than_hard():
    hard_card = make_card()
    easy_card = make_card()
    review_card(hard_card, 2, scheduler=SCHED, now=NOW)
    review_card(easy_card, 4, scheduler=SCHED, now=NOW)
    assert easy_card.due_at < NOW + timedelta(days=1) or easy_card.due_at > hard_card.due_at


# ── Stability grows across successful reviews ─────────────────────────────────
def test_stability_grows_with_good_reviews():
    card = make_card()
    now = NOW
    review_card(card, 3, scheduler=SCHED, now=now)
    s1 = card.stability
    # Review again exactly when due, three times
    for _ in range(3):
        now = card.due_at
        review_card(card, 3, scheduler=SCHED, now=now)
    assert card.stability > s1
    assert card.repetitions == 4


# ── Relearning on lapse after graduation ──────────────────────────────────────
def test_lapse_after_review_enters_relearning():
    card = make_card()
    review_card(card, 4, scheduler=SCHED, now=NOW)     # graduate to Review
    now = card.due_at
    result = review_card(card, 1, scheduler=SCHED, now=now)
    assert card.fsrs_state == 3          # Relearning
    assert card.lapses == 1
    assert result.again is True


# ── Result shape ──────────────────────────────────────────────────────────────
def test_review_result_fields():
    card = make_card()
    result = review_card(card, 3, scheduler=SCHED, now=NOW)
    assert isinstance(result, ReviewResult)
    assert result.card_id == "test-card"
    assert result.rating == 3
    assert isinstance(result.interval_days, int)
    assert result.due_at.tzinfo is not None
