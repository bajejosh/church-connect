-- Nearer, My God, to Thee (Public Domain)
-- SQL for inserting into songs table

INSERT INTO songs (
    church_id,
    title,
    artist,
    default_key,
    tempo,
    lyrics,
    chords,
    notes
)
SELECT 
    id AS church_id,
    'Nearer, My God, to Thee' AS title,
    'Sarah Flower Adams' AS artist,
    'Eb' AS default_key,
    70 AS tempo,
    E'[Verse 1]
Nearer, my God, to Thee, nearer to Thee!
E''en though it be a cross that raiseth me,
Still all my song shall be, nearer, my God, to Thee.
Nearer, my God, to Thee, nearer to Thee!

[Verse 2]
Though like the wanderer, the sun gone down,
Darkness be over me, my rest a stone.
Yet in my dreams I''d be nearer, my God to Thee.
Nearer, my God, to Thee, nearer to Thee!

[Verse 3]
There let the way appear, steps unto Heav''n;
All that Thou sendest me, in mercy giv''n;
Angels to beckon me nearer, my God, to Thee.
Nearer, my God, to Thee, nearer to Thee!

[Verse 4]
Then, with my waking thoughts bright with Thy praise,
Out of my stony griefs Bethel I''ll raise;
So by my woes to be nearer, my God, to Thee.
Nearer, my God, to Thee, nearer to Thee!',
    E'[Verse]
Eb - Bb - Eb
Ab - Eb - Bb - Eb
Eb - Bb - Eb - Ab - Eb - Bb
Eb - Bb - Eb',
    'Written by Sarah Flower Adams in 1841. The hymn is loosely based on Jacob''s dream in Genesis 28:11-19, where he sees a ladder extending from earth to heaven. It was famously played by the band on the RMS Titanic as it sank in 1912.' AS notes
FROM churches
LIMIT 1;
