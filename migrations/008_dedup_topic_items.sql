-- =============================================================
-- SynthesisOverthrust — migrations/008_dedup_topic_items.sql
-- Defect SO-D4: the seed inserts topic_items WITHOUT explicit ids,
-- so its INSERT OR IGNORE never ignores anything — every re-run
-- duplicated all items, diluting v_node_mastery averages with
-- 0-mastery copies.
--
-- 1. Re-point user progress / SR cards from duplicate items to the
--    canonical (lowest-id) copy; rows that clash with an existing
--    canonical row are dropped (the canonical row wins).
-- 2. Delete the duplicate items.
-- 3. Add the missing UNIQUE index so the seed's OR IGNORE finally
--    works and re-runs stay idempotent.
-- =============================================================

CREATE TEMP TABLE IF NOT EXISTS dup_map AS
SELECT
    ti.id AS dup_id,
    (
        SELECT MIN(k.id)
        FROM topic_items k
        WHERE k.topic_id = ti.topic_id
            AND k.content = ti.content
    ) AS keep_id
FROM topic_items ti
WHERE
    ti.id <> (
        SELECT MIN(k.id)
        FROM topic_items k
        WHERE k.topic_id = ti.topic_id
            AND k.content = ti.content
    );

UPDATE OR IGNORE user_item_mastery
SET item_id = (
        SELECT keep_id
        FROM dup_map
        WHERE dup_id = user_item_mastery.item_id
    )
WHERE item_id IN (SELECT dup_id FROM dup_map);

DELETE FROM user_item_mastery
WHERE item_id IN (SELECT dup_id FROM dup_map);

UPDATE OR IGNORE sr_cards
SET item_id = (
        SELECT keep_id
        FROM dup_map
        WHERE dup_id = sr_cards.item_id
    )
WHERE item_id IN (SELECT dup_id FROM dup_map);

DELETE FROM sr_cards
WHERE item_id IN (SELECT dup_id FROM dup_map);

-- FK cascade may be off during migrations — clean orphaned reviews
DELETE FROM sr_reviews
WHERE card_id NOT IN (SELECT id FROM sr_cards);

DELETE FROM topic_items
WHERE id IN (SELECT dup_id FROM dup_map);

DROP TABLE dup_map;

CREATE UNIQUE INDEX IF NOT EXISTS idx_topic_items_topic_content
    ON topic_items (topic_id, content);
