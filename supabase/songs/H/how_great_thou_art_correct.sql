-- How Great Thou Art (Public Domain)
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
    'How Great Thou Art' AS title,
    'Stuart K. Hine' AS artist,
    'A',
    72,
    E'[Verse 1]
O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made,
I see the stars, I hear the rolling thunder,
Thy pow''r throughout the universe displayed.

[Chorus]
Then sings my soul, my Savior God, to Thee:
How great Thou art, how great Thou art!
Then sings my soul, my Savior God, to Thee:
How great Thou art, how great Thou art!

[Verse 2]
When through the woods and forest glades I wander
And hear the birds sing sweetly in the trees,
When I look down from lofty mountain grandeur,
And hear the brook and feel the gentle breeze.

[Verse 3]
And when I think that God, His Son not sparing,
Sent Him to die, I scarce can take it in,
That on the cross, my burden gladly bearing,
He bled and died to take away my sin.

[Verse 4]
When Christ shall come with shout of acclamation
And take me home, what joy shall fill my heart!
Then I shall bow in humble adoration,
And there proclaim, my God, how great Thou art!',
    E'[Verse]
A - E - A
A - D - A - E
A - E - A
A - E - A

[Chorus]
A - D - A
E - A - E
A - D - A
E - A',
    'Originally a Swedish poem "O Store Gud" written by Carl Gustav Boberg in 1885. Translated into English by Stuart K. Hine in 1949. This hymn reflects on God''s majesty seen in nature and His sacrifice on the cross.' AS notes
FROM churches
LIMIT 1;
