-- Pass Me Not, O Gentle Savior (Public Domain)
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
    'Pass Me Not, O Gentle Savior' AS title,
    'Fanny Crosby' AS artist,
    'G' AS default_key,
    72 AS tempo,
    E'[Verse 1]
Pass me not, O gentle Savior,
Hear my humble cry;
While on others Thou art calling,
Do not pass me by.

[Chorus]
Savior, Savior, hear my humble cry;
While on others Thou art calling,
Do not pass me by.

[Verse 2]
Let me at Thy throne of mercy
Find a sweet relief;
Kneeling there in deep contrition,
Help my unbelief.

[Verse 3]
Trusting only in Thy merit,
Would I seek Thy face;
Heal my wounded, broken spirit,
Save me by Thy grace.

[Verse 4]
Thou the Spring of all my comfort,
More than life to me,
Whom have I on earth beside Thee?
Whom in heav''n but Thee?',
    E'[Verse]
G - C - G - D
G - C - D
G - C - G - D
G - D - G

[Chorus]
G - C - G - D
G - C - D
G - C - G - D
G - D - G',
    'Written by Fanny Crosby in 1868, who was blind from infancy. This hymn was inspired by the story of blind Bartimaeus in the Bible who called out to Jesus, "Do not pass me by!" (Mark 10:46-52). The music was composed by William H. Doane.' AS notes
FROM churches
LIMIT 1;
