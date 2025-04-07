-- Amazing Grace (Public Domain)
-- SQL for inserting into songs table with proper formatting

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
    'Amazing Grace' AS title,
    'John Newton' AS artist,
    'G',
    72,
    E'[Verse 1]
Amazing grace! how sweet the sound,
That saved a wretch like me!
I once was lost, but now am found,
Was blind, but now I see.

[Verse 2]
''Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed!

[Verse 3]
Through many dangers, toils, and snares,
I have already come;
''Tis grace hath brought me safe thus far,
And grace will lead me home.

[Verse 4]
The Lord has promised good to me,
His Word my hope secures;
He will my Shield and Portion be,
As long as life endures.',
    E'[Verse]
G - G7 - C - G
Em - D - G - D
G - G7 - C - G
Em - D - G

[Verse 2]
G - G7 - C - G
Em - D - G - D
G - G7 - C - G
Em - D - G',
    'This classic hymn was written by John Newton, a former slave trader who experienced a profound conversion to Christianity.' AS notes
FROM churches
LIMIT 1;
