-- Blessed Assurance (Public Domain)
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
    'Blessed Assurance' AS title,
    'Fanny Crosby' AS artist,
    'D',
    76,
    E'[Verse 1]
Blessed assurance, Jesus is mine!
Oh, what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed in His blood.

[Chorus]
This is my story, this is my song,
Praising my Savior all the day long;
This is my story, this is my song,
Praising my Savior all the day long.

[Verse 2]
Perfect submission, perfect delight,
Visions of rapture now burst on my sight;
Angels, descending, bring from above
Echoes of mercy, whispers of love.

[Verse 3]
Perfect submission, all is at rest,
I in my Savior am happy and blest;
Watching and waiting, looking above,
Filled with His goodness, lost in His love.',
    E'[Verse]
D - A7 - D
G - D - E - A
D - A7 - D
G - D - A - D

[Chorus]
D - A7 - D
G - D - A - D
D - A7 - D
G - D - A - D',
    'Written by Fanny Crosby in 1873, with music by Phoebe Knapp. This hymn expresses the joy and confidence of the Christian who is assured of salvation in Christ.' AS notes
FROM churches
LIMIT 1;
