-- It Is Well With My Soul (Public Domain)
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
    'It Is Well With My Soul' AS title,
    'Horatio G. Spafford' AS artist,
    'Eb' AS default_key,
    63 AS tempo,
    E'[Verse 1]
When peace like a river attendeth my way,
When sorrows like sea billows roll;
Whatever my lot, Thou hast taught me to say,
"It is well, it is well with my soul."

[Chorus]
It is well with my soul,
It is well, it is well with my soul.

[Verse 2]
Though Satan should buffet, though trials should come,
Let this blest assurance control,
That Christ has regarded my helpless estate,
And has shed His own blood for my soul.

[Verse 3]
My sin—oh, the bliss of this glorious thought—
My sin, not in part, but the whole,
Is nailed to the cross, and I bear it no more,
Praise the Lord, praise the Lord, O my soul!

[Verse 4]
And, Lord, haste the day when the faith shall be sight,
The clouds be rolled back as a scroll,
The trump shall resound and the Lord shall descend,
"Even so"—it is well with my soul.',
    E'[Verse]
Eb - Bb - Eb - Bb
Eb - Bb - Eb
Ab - Eb - Bb - Eb
Cm - Bb - Eb

[Chorus]
Ab - Eb - Bb
Eb - Bb - Eb',
    'Written by Horatio G. Spafford in 1873 following several traumatic events in his life, including the loss of his four daughters in a shipwreck. The hymn speaks to the peace that comes from faith in God despite circumstances.' AS notes
FROM churches
LIMIT 1;
