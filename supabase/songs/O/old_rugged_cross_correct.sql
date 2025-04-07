-- The Old Rugged Cross (Public Domain)
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
    'The Old Rugged Cross' AS title,
    'George Bennard' AS artist,
    'A',
    76,
    E'[Verse 1]
On a hill far away stood an old rugged cross,
the emblem of suffering and shame;
and I love that old cross where the dearest and best
for a world of lost sinners was slain.

[Chorus]
So I''ll cherish the old rugged cross,
till my trophies at last I lay down;
I will cling to the old rugged cross,
and exchange it some day for a crown.

[Verse 2]
O that old rugged cross, so despised by the world,
has a wondrous attraction for me;
for the dear Lamb of God left his glory above
to bear it to dark Calvary.

[Verse 3]
In that old rugged cross, stained with blood so divine,
a wondrous beauty I see,
for ''twas on that old cross Jesus suffered and died,
to pardon and sanctify me.

[Verse 4]
To the old rugged cross I will ever be true,
its shame and reproach gladly bear;
then he''ll call me some day to my home far away,
where his glory forever I''ll share.',
    E'[Verse]
A - A7 - D - B7
E - E7 - A - A7

[Chorus]
E - E7 - A - A7
D - D7 - A - A7
A - A7 - D - D7
A - E - A',
    'Written by George Bennard in 1912-1913, this hymn speaks of the writer''s Christian experience and adoration of Christ and His sacrifice on the cross.' AS notes
FROM churches
LIMIT 1;
