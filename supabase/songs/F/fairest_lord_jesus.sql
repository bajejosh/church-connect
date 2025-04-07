-- Fairest Lord Jesus (Public Domain)
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
    'Fairest Lord Jesus' AS title,
    'German Hymn' AS artist,
    'F' AS default_key,
    76 AS tempo,
    E'[Verse 1]
Fairest Lord Jesus, Ruler of all nature,
O Thou of God and man the Son,
Thee will I cherish, Thee will I honor,
Thou, my soul''s glory, joy, and crown.

[Verse 2]
Fair are the meadows, fairer still the woodlands,
Robed in the blooming garb of spring;
Jesus is fairer, Jesus is purer,
Who makes the woeful heart to sing.

[Verse 3]
Fair is the sunshine, fairer still the moonlight,
And all the twinkling starry host;
Jesus shines brighter, Jesus shines purer
Than all the angels heav''n can boast.

[Verse 4]
Beautiful Savior! Lord of all the nations!
Son of God and Son of Man!
Glory and honor, praise, adoration,
Now and forevermore be Thine.',
    E'[Verse]
F - C - F - Bb
F - C - F
F - C - F - Bb
F - C - F',
    'This hymn originated from a Silesian folk song in the 17th century and was translated from German ("Schönster Herr Jesu") to English in 1873 by Joseph A. Seiss. The hymn is sometimes called "Beautiful Savior" in other translations.' AS notes
FROM churches
LIMIT 1;
