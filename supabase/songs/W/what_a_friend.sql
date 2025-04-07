-- What a Friend We Have in Jesus (Public Domain)
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
    'What a Friend We Have in Jesus' AS title,
    'Joseph M. Scriven' AS artist,
    'F' AS default_key,
    76 AS tempo,
    E'[Verse 1]
What a friend we have in Jesus,
All our sins and griefs to bear!
What a privilege to carry
Everything to God in prayer!
Oh, what peace we often forfeit,
Oh, what needless pain we bear,
All because we do not carry
Everything to God in prayer!

[Verse 2]
Have we trials and temptations?
Is there trouble anywhere?
We should never be discouraged—
Take it to the Lord in prayer.
Can we find a friend so faithful,
Who will all our sorrows share?
Jesus knows our every weakness;
Take it to the Lord in prayer.

[Verse 3]
Are we weak and heavy-laden,
Cumbered with a load of care?
Precious Savior, still our refuge—
Take it to the Lord in prayer.
Do thy friends despise, forsake thee?
Take it to the Lord in prayer!
In His arms He''ll take and shield thee,
Thou wilt find a solace there.',
    E'[Verse]
F - C7 - F
Bb - F - C - F
F - C7 - F
Bb - F - C - F',
    'Written by Joseph M. Scriven in 1855 as a poem to comfort his mother who was living in Ireland while he was in Canada. It was not originally intended to be a hymn, but was later set to music by Charles C. Converse in 1868.' AS notes
FROM churches
LIMIT 1;
