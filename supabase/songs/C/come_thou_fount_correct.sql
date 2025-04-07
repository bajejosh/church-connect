-- Come Thou Fount (Public Domain)
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
    'Come Thou Fount of Every Blessing' AS title,
    'Robert Robinson' AS artist,
    'G',
    86,
    E'[Verse 1]
Come, Thou Fount of every blessing,
Tune my heart to sing Thy grace;
Streams of mercy, never ceasing,
Call for songs of loudest praise.
Teach me some melodious sonnet,
Sung by flaming tongues above.
Praise the mount, I''m fixed upon it,
Mount of Thy redeeming love.

[Verse 2]
Here I raise my Ebenezer;
Here by Thy great help I''ve come;
And I hope, by Thy good pleasure,
Safely to arrive at home.
Jesus sought me when a stranger,
Wandering from the fold of God;
He, to rescue me from danger,
Interposed His precious blood.

[Verse 3]
O to grace how great a debtor
Daily I''m constrained to be!
Let Thy goodness, like a fetter,
Bind my wandering heart to Thee.
Prone to wander, Lord, I feel it,
Prone to leave the God I love;
Here''s my heart, O take and seal it,
Seal it for Thy courts above.',
    E'[Verse]
G - C - G - D
G - C - G - D
G - C - G - D
G - C - D - G

[Verse 2]
G - C - G - D
G - C - G - D
G - C - G - D
G - C - D - G',
    'Written in 1758 by Robert Robinson when he was just 22 years old. The term "Ebenezer" refers to a stone of remembrance from 1 Samuel 7:12.' AS notes
FROM churches
LIMIT 1;
